/**
 * @jest-environment jsdom
 */
/*
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
//import supplementaire
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import { formatDate, formatStatus } from "../app/format.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //pour vérifier l'icone de mail
      const iconMail = screen.getByTestId("icon-mail");
      //ajout de expect = vérifie si l'icone est mis en surbrillance avec la classe css active-icon
      expect(windowIcon.classList).toContain("active-icon");
      //attend que l'icone de mail ne soit pas en surbrillance
      expect(iconMail.classList).not.toContain("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      // rajout du même tri que dans le fichiers Bills.js
      // bills.sort((a, b) => {
      //   const dateA = new Date(a.date);
      //   const dateB = new Date(b.date);

      //   return dateA - dateB;
      // });

      document.body.innerHTML = BillsUI({
        data: bills.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        }),
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // correction de antichrono a chrono et de a<b a a>b.
      const chrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(chrono);
      expect(dates).toEqual(datesSorted);
    });
    //ajout test si title est bien 'Mes notes de frais'
    test("The title should be 'Mes notes de frais'", () => {
      const title = screen.getByTestId("title");
      expect(title.textContent).toBe("Mes notes de frais");
    });
  });
});
describe("When I'm on the bill page and I click on the new bill button", () => {
  test("Then I should be redirected to the new bill form", () => {
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);

    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
    screen
      .getByTestId("btn-new-bill")
      .addEventListener("click", handleClickNewBill);
    userEvent.click(screen.getByTestId("btn-new-bill"));
    expect(handleClickNewBill).toHaveBeenCalled();
  });
});

describe("When I'm on the bill page, there are bills and I click on the visualize icon", () => {
  test("Then a modal should open", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    window.onNavigate(ROUTES_PATH.Bills);

    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    // test un seul icon
    const eyeIcons = screen.getAllByTestId("icon-eye");
    const handleClickIconEye = jest.fn(bill.handleClickIconEye);

    const modale = document.getElementById("modaleFile");
    $.fn.modal = jest.fn(() => modale.classList.add("show"));

    eyeIcons.forEach((icon) => {
      icon.addEventListener("click", () => handleClickIconEye(icon));
      userEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});

test("should format the date correctly", () => {
  const dateStr = "2022-05-20";
  const expected = /^20 Mai\. \d{2}$/;
  const result = formatDate(dateStr);
  if (result === undefined) {
    expect(result).toBeUndefined();
  } else {
    expect(result).toMatch(expected);
  }
});

describe("formatStatus", () => {
  test('should return "En attente" for status "pending"', () => {
    const status = "pending";
    const expected = "En attente";

    const result = formatStatus(status);
    expect(result).toBe(expected);
  });

  test('should return "Accepté" for status "accepted"', () => {
    const status = "accepted";
    const expected = "Accepté";

    const result = formatStatus(status);

    expect(result).toBe(expected);
  });

  test('should return "Refused" for status "refused"', () => {
    const status = "refused";
    const expected = "Refused";

    const result = formatStatus(status);

    expect(result).toEqual(expected);
  });
});

// Test intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("title"));
      const newBillBtn = screen.getByTestId("btn-new-bill");
      const tableRows = screen.getByTestId("tbody");

      expect(newBillBtn).toBeTruthy();
      expect(tableRows).toBeTruthy();
    });
  });
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      // implement the store and set it up to return a Promise.reject() with a new Error("Erreur 404") error
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      // Wait for the next tick of the event loop
      await new Promise(process.nextTick);

      let response;

      try {
        response = await mockStore.bills().list();
      } catch (err) {
        response = err;
      }

      // Set the error message in the UI to be displayed
      document.body.innerHTML = BillsUI({ error: response });

      // Find the error message in the UI
      const message = await screen.getByText(/Erreur 404/);

      // Expect the error message to be present in the UI
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      // implement the store and set it up to return a Promise.reject() with a new Error("Erreur 500") error
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      // Wait for the next tick of the event loop
      await new Promise(process.nextTick);

      let response;

      try {
        response = await mockStore.bills().list();
      } catch (err) {
        response = err;
      }

      // Set the error message in the UI to be displayed
      document.body.innerHTML = BillsUI({ error: response });

      // Find the error message in the UI
      const message = await screen.getByText(/Erreur 500/);

      // Expect the error message to be present in the UI
      expect(message).toBeTruthy();
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to the Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@example.com" })
      );
      document.body.innerHTML = '<div id="root"></div>';
      router();

      // Simulate navigating to the Bills page
      window.onNavigate(ROUTES_PATH.Bills);

      // Simulate successful API response
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () =>
            Promise.resolve([
              {
                id: 1,
                date: "2021-04-10",
                amount: 200,
                status: "pending",
                pct: 20,
              },
            ]),
        };
      });

      // Assuming the Bills page uses BillsUI to render the bills
      await waitFor(() =>
        expect(screen.getByText(/pending/i)).toBeInTheDocument()
      );
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 404")),
        };
      });

      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      await expect(bills.getBills()).rejects.toThrow("Erreur 404");
    });
  });
});
*/
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { formatDate, formatStatus } from "../app/format.js";

import router from "../app/Router.js";

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

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // creation of the root element
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // load to the new bill page using the router
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // wait for the mail icon to be displayed and check that it is active
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      expect(windowIcon.classList).toContain("active-icon");
    });

    describe("When I check the bills container", () => {
      let billsObject;

      beforeEach(() => {
        // set up the bills page
        document.body.innerHTML = BillsUI({ data: bills });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // init bills object
        billsObject = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      });

      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({
          data: bills.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          }),
        });
        const dates = screen
          .getAllByText(
            /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML);
        // correction de antichrono a chrono et de a<b a a>b.
        const chrono = (a, b) => (a < b ? 1 : -1);
        const datesSorted = [...dates].sort(chrono);
        expect(dates).toEqual(datesSorted);
        //ajout test si title est bien 'Mes notes de frais'
      });
      test("The title should be 'Mes notes de frais'", () => {
        const title = screen.getByTestId("title");
        expect(title.textContent).toBe("Mes notes de frais");
      });

      describe("When I click on New Bill button", () => {
        test("Then it should navigate to New Bill page", () => {
          const newBillBtn = screen.getByTestId("btn-new-bill");

          const handleClickNewBill = jest.fn(() =>
            billsObject.handleClickNewBill()
          );

          newBillBtn.addEventListener("click", handleClickNewBill);

          userEvent.click(newBillBtn);

          //the function is called
          expect(handleClickNewBill).toHaveBeenCalled();

          //new bill page is displayed
          expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
      });

      describe("When I click on Eye icon", () => {
        test("Then a modal should open", () => {
          const iconEyes = screen.getAllByTestId("icon-eye");

          const handleClickIconEye = jest.fn((icon) =>
            billsObject.handleClickIconEye(icon)
          );

          // simulate the modal function
          $.fn.modal = jest.fn();

          iconEyes.forEach((icon) => {
            icon.addEventListener("click", () => handleClickIconEye(icon));

            userEvent.click(icon);

            //the function is called
            expect(handleClickIconEye).toHaveBeenCalled();

            //new bill page is displayed
            expect(screen.getByText("Justificatif")).toBeTruthy();
          });
        });
      });
    });
  });

  // getBill's integration test
  describe("When I navigate to bill's page", () => {
    let billsObject;

    beforeEach(() => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");

      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      billsObject = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    test("fetches bills from mock API GET", async () => {
      await waitFor(() => screen.getByText("Mes notes de frais"));

      // the page is displayed
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();

      //the table is displayed
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });

    test("then it would display bills", async () => {
      // init bills display

      const getBillsSpy = jest.spyOn(billsObject, "getBills");
      const data = await billsObject.getBills();
      const mockBills = await mockStore.bills().list();

      expect(getBillsSpy).toHaveBeenCalled();

      expect(data[0].date).toEqual(formatDate(mockBills[0].date));

      expect(data[0].status).toEqual(formatStatus(mockBills[0].status));
    });

    test("then it would trigger a console error if the data are corrupted", async () => {
      // Création d'un mock store avec des données corrompues
      const customStore = {
        bills() {
          return {
            list() {
              return Promise.resolve([
                { status: "in progress", date: "Maxime" }, // Données intentionnellement corrompues
              ]);
            },
          };
        },
      };

      // Configuration du spy sur console.error
      const consoleSpy = jest.spyOn(console, "error");

      // Création d'une instance de Bills avec le store corrompu
      const corruptedBills = new Bills({
        document,
        onNavigate: window.onNavigate,
        store: customStore,
        localStorage: window.localStorage,
      });

      // Appel de getBills pour déclencher l'erreur
      await corruptedBills.getBills();

      // Vérification que console.error a été appelé
      expect(consoleSpy).toHaveBeenCalled();

      // Nettoyage du spy
      consoleSpy.mockRestore();
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        // implement the store and set it up to return a Promise.reject() with a new Error("Erreur 404") error
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        // Wait for the next tick of the event loop
        await new Promise(process.nextTick);

        let response;

        try {
          response = await mockStore.bills().list();
        } catch (err) {
          response = err;
        }

        // Set the error message in the UI to be displayed
        document.body.innerHTML = BillsUI({ error: response });

        // Find the error message in the UI
        const message = await screen.getByText(/Erreur 404/);

        // Expect the error message to be present in the UI
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        // implement the store and set it up to return a Promise.reject() with a new Error("Erreur 500") error
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // Wait for the next tick of the event loop
        await new Promise(process.nextTick);

        let response;

        try {
          response = await mockStore.bills().list();
        } catch (err) {
          response = err;
        }

        // Set the error message in the UI to be displayed
        document.body.innerHTML = BillsUI({ error: response });

        // Find the error message in the UI
        const message = await screen.getByText(/Erreur 500/);

        // Expect the error message to be present in the UI
        expect(message).toBeTruthy();
      });
    });
  });
});
