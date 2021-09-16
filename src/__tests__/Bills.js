import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

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
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on bills Page but it is loading", () => {
    test("Then LoadingPage should be displayed", () => {
      const html = BillsUI({ data: bills, loading: true })
      document.body.innerHTML = html
      
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on bills Page but there is an error message", () => {
      test("Then ErrorPage should be displayed", () => {
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

      const html = BillsUI(bills[0])
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firestore = null
      const Bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const newBillButton = screen.getByTestId('btn-new-bill')

      const handleClickNewBill = jest.fn(Bill.handleClickNewBill())
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()

      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()

    })

  })

  describe('When I click on the icon eye', () => {
    test('Then a modal should open', () => {

      const html = BillsUI(bills)
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firestore = null
      const Bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const icon = screen.queryAllByTestId("icon-eye")

      const handleClickIconEye = jest.fn(Bill.handleClickIconEye(icon))
      icon.addEventListener('click', handleClickIconEye)
      userEvent.click(icon)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    
    })

  })

})

