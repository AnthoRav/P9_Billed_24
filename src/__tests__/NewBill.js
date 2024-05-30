// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
 import userEvent from '@testing-library/user-event'
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import {ROUTES, ROUTES_PATH} from "../constants/routes"
 import {localStorageMock} from "../__mocks__/localStorage.js"
 import mockStore from "../__mocks__/store.js"
 import router from "../app/Router.js"
 
 jest.mock("../app/store", () => mockStore)
 
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })
  })
   
  test("Then the new bill's form should be loaded with its fields", () => {
    document.body.innerHTML = NewBillUI()
    expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    expect(screen.getByTestId("expense-type")).toBeTruthy()
    expect(screen.getByTestId("expense-name")).toBeTruthy()
    expect(screen.getByTestId("datepicker")).toBeTruthy()
    expect(screen.getByTestId("amount")).toBeTruthy()
    expect(screen.getByTestId("vat")).toBeTruthy()
    expect(screen.getByTestId("pct")).toBeTruthy()
    expect(screen.getByTestId("commentary")).toBeTruthy()
    expect(screen.getByTestId("file")).toBeTruthy()
    expect(screen.getByRole("button")).toBeTruthy()
  })
   
  test('Then I can select upload an image file', () => {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
    document.body.innerHTML = NewBillUI()
    mockStore.bills = jest.fn().mockImplementation(() => { return { create: () => { Promise.resolve({}) }}})
    const onNavigate = (pathname) => { document.body.innerHTML = pathname }
    const newBill = new NewBill({  document, onNavigate, store: mockStore, localStorage: window.localStorage })
    const handleChangeFile = jest.fn(newBill.handleChangeFile)
    const inputFile = screen.getByTestId("file")
    expect(inputFile).toBeTruthy()
    const file = new File(["file"], "file.jpg", {type: "image/jpeg"})
    inputFile.addEventListener("change", handleChangeFile)
    fireEvent.change(inputFile, { target: { files: [file] }})
    expect(handleChangeFile).toHaveBeenCalled()
    expect(inputFile.files).toHaveLength(1)
    expect(inputFile.files[0].name).toBe("file.jpg")
    jest.spyOn(window, "alert").mockImplementation(() => { })
    expect(window.alert).not.toHaveBeenCalled()
  })
   
  test("Then I can't select upload a non image file", () => {
    document.body.innerHTML = NewBillUI()
    const store = null
    const onNavigate = (pathname) => { document.body.innerHTML = pathname }
    const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
    const handleChangeFile = jest.fn(newBill.handleChangeFile)
    const inputFile = screen.getByTestId("file")
    expect(inputFile).toBeTruthy()
    inputFile.addEventListener("change", handleChangeFile)
    fireEvent.change(inputFile, { target: { files: [new File(["file.pdf"], "file.pdf", {type: "file/pdf"})] }})
    expect(handleChangeFile).toHaveBeenCalled()
    expect(inputFile.files[0].name).not.toBe("file.jpg")
    jest.spyOn(window, "alert").mockImplementation(() => { })
    expect(window.alert).toHaveBeenCalled()
  })
})
 //test integration POST
describe('Given I am a user connected as Employee', () => {
  describe("When I submit the form completed", () => {
    test("Then the bill is created", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({pathname}) }
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const validBill = {
        type: "Restaurants et bars",
        name: "Vol Paris Londres",
        date: "2022-02-15",
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: "Commentary",
        fileUrl: "../img/0.jpg",
        fileName: "test.jpg",
        status: "pending"
      }
      screen.getByTestId("expense-type").value = validBill.type
      screen.getByTestId("expense-name").value = validBill.name
      screen.getByTestId("datepicker").value = validBill.date
      screen.getByTestId("amount").value = validBill.amount
      screen.getByTestId("vat").value = validBill.vat
      screen.getByTestId("pct").value = validBill.pct
      screen.getByTestId("commentary").value = validBill.commentary
      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl
      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    })
    test('fetches error from an API and fails with 404 error', async () => {
      jest.spyOn(mockStore, 'bills');
      jest.spyOn(console, 'error').mockImplementation(() => { });
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = `<div id="root"></div>`;
      router();
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }); }
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => Promise.reject(new Error('Erreur 404')),
          list: () => Promise.reject(new Error('Erreur 404'))
        };
      });
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
    test('fetches error from an API and fails with 500 error', async () => {
      jest.spyOn(mockStore, 'bills')
      jest.spyOn(console, 'error').mockImplementation(() => { })
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      Object.defineProperty(window, 'location', {value: {hash: ROUTES_PATH['NewBill']}})
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      document.body.innerHTML = `<div id="root"></div>`
      router()
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({pathname}) }
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => Promise.reject(new Error('Erreur 500')),
          list: () => Promise.reject(new Error('Erreur 500'))
        }
      })
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})

      // Submit form
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
    test("should not submit the form if required fields are empty", () => {
      document.body.innerHTML = NewBillUI()

      const form = screen.getByTestId("form-new-bill");
      
      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount.value).toBe("");
      const handleSubmit = jest.fn((e) => e.preventDefault())
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

  });
  })
})
