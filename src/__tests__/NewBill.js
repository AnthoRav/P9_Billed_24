/**
 * @jest-environment jsdom
 */

// import { screen } from "@testing-library/dom";
// import NewBillUI from "../views/NewBillUI.js";
// import NewBill from "../containers/NewBill.js";

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ...", () => {
//       const html = NewBillUI();
//       document.body.innerHTML = html;
//       //to-do write assertion
//     });
//   });
// });

/*
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

function fillFormWithData() {
  const typeInput = screen.getByTestId("expense-type");
  const nameInput = screen.getByTestId("expense-name");
  const dateInput = screen.getByTestId("datepicker");
  const amountInput = screen.getByTestId("amount");
  const vatInput = screen.getByTestId("vat");
  const pctInput = screen.getByTestId("pct");
  const commentaryTextarea = screen.getByTestId("commentary");

  userEvent.selectOptions(typeInput, "Transports");
  userEvent.type(nameInput, "Flight to Paris");
  userEvent.type(dateInput, "2021-08-20");
  userEvent.type(amountInput, "150");
  userEvent.type(vatInput, "20");
  userEvent.type(pctInput, "20");
  userEvent.type(commentaryTextarea, "Business trip to Paris");
}

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // set up the mock localStorage and mock user for the test
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
  });

  describe("When I am on NewBill Page", () => {
    test("then mail icon in vertical layout should be highlighted", async () => {
      // creation of the root element
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // load to the new bill page using the router
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // wait for the mail icon to be displayed and check that it is active
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");

      expect(mailIcon.classList).toContain("active-icon");
    });
    test("The title should be 'Envoyer une note de frais'", () => {
      const title = screen.getByTestId("title-newbill");
      expect(title.textContent).toBe(" Envoyer une note de frais ");
    });
  });

  describe("When I fill the form ", () => {
    let newBill;

    beforeEach(() => {
      // set up the new bill
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    describe("When I upload a file", () => {
      let handleChangeFile;

      beforeEach(() => {
        // create the handleChangeFile mocked function
        handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      });

      test("then handleChangeFile should be triggered ", async () => {
        // get the input file element and add the event listener
        await waitFor(() => screen.getByTestId("file"));
        const inputFile = screen.getByTestId("file");

        inputFile.addEventListener("change", handleChangeFile);

        // creation of the test file to upload
        const testFile = new File(["test"], "test.jpg", { type: "image/jpg" });

        // simulate the file upload
        fireEvent.change(inputFile, {
          target: {
            files: [testFile],
          },
        });

        // check that the file name is displayed
        expect(screen.getByTestId("file").files[0].name).toBe("test.jpg");

        // check that handleChangeFile is called
        expect(handleChangeFile).toHaveBeenCalled();

        // check formdata values
        expect(inputFile.files[0]).toEqual(testFile);
      });

      test("it should trigger an error alert", async () => {
        // Préparation de l'interface utilisateur et du mock pour le test
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Mock de window.alert
        window.alert = jest.fn();

        // Simuler l'ajout d'un fichier avec une mauvaise extension
        const inputFile = screen.getByTestId("file");
        const file = new File([""], "file.txt", { type: "text/plain" });
        fireEvent.change(inputFile, { target: { files: [file] } });

        // Vérifier si alert a été appelé avec le bon message
        expect(window.alert).toHaveBeenCalledWith(
          "Veuillez soumettre un fichier ayant l'extension .jpg, .jpeg, ou .png."
        );

        // Nettoyage du mock
        window.alert.mockRestore();
      });
    });

    // POST integration test

    describe("When I click on the submit button", () => {
      test("then it should create a new bill", () => {
        // fill all the fields with custom values
        const customInputs = [
          {
            testId: "expense-type",
            value: "Transports",
          },
          {
            testId: "expense-name",
            value: "Vol Paris-Bordeaux",
          },
          {
            testId: "datepicker",
            value: "2023-04-01",
          },
          {
            testId: "amount",
            value: "42",
          },
          {
            testId: "vat",
            value: 18,
          },
          {
            testId: "pct",
            value: 20,
          },
          {
            testId: "commentary",
            value: "test bill",
          },
        ];

        // fill the form inputs with the custom values
        customInputs.forEach((input) =>
          fireEvent.change(screen.getByTestId(input.testId), {
            target: { value: input.value },
          })
        );

        // spy the onNavigate and updateBill method
        const spyOnNavigate = jest.spyOn(newBill, "onNavigate");

        const spyUpdateBill = jest.spyOn(newBill, "updateBill");

        // mock the handleSubmit function
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);

        // submit the form
        fireEvent.submit(form);

        // check that the handleSubmit function was called
        expect(handleSubmit).toHaveBeenCalled();

        // check that the updateBill method was called with the right values
        expect(spyUpdateBill).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "Transports",
            name: "Vol Paris-Bordeaux",
            date: "2023-04-01",
            amount: 42,
            vat: "18",
            pct: 20,
            commentary: "test bill",
            status: "pending",
          })
        );

        // check that the onNavigate method was called with the right path
        expect(spyOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);

        // check that the page has changed to the bill page
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
});
//handleChangeFile
describe("Given I am on the New Bill page", () => {
  beforeEach(() => {
    document.body.innerHTML = NewBillUI();
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  describe("When I upload a file with the wrong extension", () => {
    test("it should trigger an alert and reset the file input", () => {
      window.alert = jest.fn();
      const input = screen.getByTestId("file");
      const file = new File(["content"], "image.gif", { type: "image/gif" });
      userEvent.upload(input, file);
      expect(window.alert).toHaveBeenCalledWith(
        "Veuillez soumettre un fichier ayant l'extension .jpg, .jpeg, ou .png."
      );
      expect(input.value).toBe("");
    });
  });

  describe("When I submit the form with valid data", () => {
    test("it should call updateBill and navigate to bills page", () => {
      document.body.innerHTML = NewBillUI();
      const mockNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate: mockNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Créer un espion sur la méthode updateBill de newBill
      const spy = jest.spyOn(newBill, "updateBill");

      fillFormWithData();

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Vérifie que updateBill a été appelé
      expect(spy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("#employee/bills");

      // Nettoyer le spy après le test
      spy.mockRestore();
    });
  });
});
describe("Given I am connected as an employee", () => {
  describe("When I try to submit a new bill", () => {
    beforeEach(() => {
      // Initialisation du DOM et des mocks
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Simuler les réponses de l'API
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => Promise.reject(new Error("Erreur 404")),
        };
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // console.error = jest.fn();
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });

      test("post bill with 404 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("404"));
      });

      test("Add bills from an API and fails with 500 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("500"));
      });
    });
  });
});
*/

/*
import { screen, fireEvent, waitFor, createEvent } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";

function fillFormWithData() {
    const data = {
        "expense-type": "Transports",
        "expense-name": "Vol Paris-Bordeaux",
        "datepicker": "2023-04-01",
        "amount": "42",
        "vat": "18",
        "pct": "20",
        "commentary": "test bill",
    };

    Object.entries(data).forEach(([key, value]) => {
        const input = screen.getByTestId(key);
        userEvent.type(input, value);
    });
}

describe("NewBill", () => {
    beforeEach(() => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({ email: "employee@example.com" }));
        new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
        });
    });

    describe("handleChangeFile", () => {
        test("should accept jpg, jpeg, and png files", () => {
            const input = screen.getByTestId("file");
            const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
            fireEvent.change(input, { target: { files: [file] } });

            expect(input.files[0].name).toBe("image.jpg");
        });

        test("should reject non-image files", () => {
            const alertMock = jest.spyOn(window, 'alert').mockImplementation();
            const input = screen.getByTestId("file");
            const file = new File(["content"], "document.pdf", { type: "application/pdf" });
            fireEvent.change(input, { target: { files: [file] } });

            expect(alertMock).toHaveBeenCalledWith("Veuillez soumettre un fichier ayant l'extension .jpg, .jpeg, ou .png.");
            alertMock.mockRestore();
        });
    });

    describe("handleSubmit", () => {
        test("should submit the form with filled data", () => {
            fillFormWithData();
            const form = screen.getByTestId("form-new-bill");
            const submitMock = jest.fn();
            form.onsubmit = submitMock;

            fireEvent.submit(form);

            expect(submitMock).toHaveBeenCalled();
        });

        test("should not submit the form if required fields are empty", () => {
            const form = screen.getByTestId("form-new-bill");
            const submitEvent = createEvent.submit(form);
            fireEvent.submit(form);

            expect(submitEvent.defaultPrevented).toBe(false);
        });
    });
});
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
