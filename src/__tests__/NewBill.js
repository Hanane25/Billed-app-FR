import { fireEvent,screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase.js"
import BillsUI from "../views/BillsUI.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I add a file in correct format", () => {
    test("Then the file should be uploaded and the new bill should be created", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputFile = screen.getByTestId("file")
      const correct = document.getElementById("correctFormat")
      const correctMessage = undefined

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })]
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(correct.innerText).toBe(correctMessage)

    })

  })

  describe("When I am on NewBill Page and I add an file in incorrect format", () => {
    test("Then the file shouldn't be uploaded", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile)

      const inputFile = screen.getByTestId("file")
      const error = document.getElementById("wrongFormat")
      const errorMessage = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.gif"], "image.gif", { type: "image/gif" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(error.innerText).toBe(errorMessage)

      
    })
  })
    
  describe("when I am on NewBill page", () => {
    test("Then I click on submit button", () => {

      // create NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Instanciation of NewBill class
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: localStorageMock
      })


      // mock handleSubmit method
      const handleSubmit = jest.fn(newBill.handleSubmit)

      // Submit button
      const form = screen.getByTestId("form-new-bill")

      // add submit event to submitButton
      form.addEventListener("submit", handleSubmit)

      // Click on submitButton
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()

    })

  })
  
})


//Test d'intégration POST

describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Add bill to mock API POST", async () => {

      const getSpyPost = jest.spyOn(firebase, "post")
      
      // Init newBill
      const newBill = {
        id: 'eoKIpYhECmaZAGRrHjaC',
        status: 'pending',
        pct: 10,
        amount: 500,
        email: 'test@test.com',
        name: 'Facture',
        vat: '',
        fileName: 'file.jpg',
        date: '2021-03-13',
        commentAdmin: 'à valider',
        commentary: '',
        type: 'Restaurants et bars',
        fileUrl: '',
      }

    const bills = await firebase.post(newBill);

    // getSpyPost must have been called once
    expect(getSpyPost).toHaveBeenCalledTimes(1);
    // The number of bills must be 5 
    expect(bills.data.length).toBe(5);

    })

    test('Add bill to API and fails with 404 message error', async () => {
      firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error('Erreur 404')))

      // build user interface
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;

      const message = await screen.getByText(/Erreur 404/);
      // wait for the 404 error message
      expect(message).toBeTruthy();

    })

    test("Add bill to API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })

  })
})