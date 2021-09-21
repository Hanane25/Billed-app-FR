import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import firebase from '../__mocks__/firebase'

import Bills from "../containers/Bills.js"
import { ROUTES } from '../constants/routes'
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      // build user interface
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      
      // Get text from HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      // Filter by date
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on bills Page but it is loading", () => {
    test("Then LoadingPage should be displayed", () => {
      // build user interface
      const html = BillsUI({ data: bills, loading: true })
      document.body.innerHTML = html
      
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on bills Page but there is an error message", () => {
      test("Then ErrorPage should be displayed", () => {
        // build user interface
        const html = BillsUI({ data: bills, error: true })
        document.body.innerHTML = html
  
        expect(screen.getByTestId('error-message')).toBeTruthy()
      })
  })
    
  describe('When I click on New Bill button', () => {
    test('Then New bill page should be displayed', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // build user interface
      const html = BillsUI(bills[0])
      document.body.innerHTML = html

      //Mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Init firestore
      const firestore = null

      //localStorage: permet d'accéder à un objet local Storage

      // Init Bills
      const Bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      //calling the tested element by getByTestId
      const newBillButton = screen.getByTestId('btn-new-bill')

      //create a mock function with jest: they let you spy on the behavior of a function that is called indirectly by some other code, rather than just testing the output
      // Mock handleClickNewBill
      const handleClickNewBill = jest.fn(Bill.handleClickNewBill())

      //when the tested element was clicked, the function handleClickNewBill is called
      newBillButton.addEventListener('click', handleClickNewBill)

      //to test mouse interaction as the user interacts with it
      userEvent.click(newBillButton)

      //to ensure if the mock function (handleClickNewBill) is called
      expect(handleClickNewBill).toHaveBeenCalled()

      //to test if we have the expected result: in this case it's the new bill page display 
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()

    })

  })

  describe('When I click on the icon eye', () => {
    test('Then a modal should open', () => {

      Object.defineProperty(window,'localStorage', { value:localStorageMock })
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee'
      }))

      // build user interface
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      
      // Init firestore
      const firestore = null
      // Init Bills
      const Bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      
      // Mock modal comportment
      $.fn.modal = jest.fn();

      // Get button eye in DOM
      const iconEye = screen.queryAllByTestId("icon-eye")
      
      // Mock function handleClickIconEye
      const handleClickIconEye = jest.fn(Bill.handleClickIconEye)
      iconEye[0].addEventListener('click', handleClickIconEye(iconEye[0]))
      userEvent.click(iconEye[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    
    })

  })

})



//Test d'intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")

      // Get bills and the new bill
       const bills = await firebase.get()

       // getSpy must have been called once
       expect(getSpy).toHaveBeenCalledTimes(1)
       // The number of bills must be 4
       expect(bills.data.length).toBe(4)
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )

      // user interface creation with error code
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 404/)
      // wait for the error message 400
      expect(message).toBeTruthy()
    })

    test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error('Erreur 500')))

      // user interface creation with error code
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 500/)
      // wait for the error message 400
      expect(message).toBeTruthy()
  })

  })
})
