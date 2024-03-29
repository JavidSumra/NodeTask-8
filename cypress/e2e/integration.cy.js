let studentSubmissionUrl =
  Cypress.env("USER_LOCAL_URL") || "http://localhost:3000";
if (studentSubmissionUrl.endsWith("/")) {
  studentSubmissionUrl = studentSubmissionUrl.slice(0, -1);
}
const clearSignUpFields = (cy) => {
  cy.get('input[name="FirstName"]').clear();
  cy.get('input[name="email"]').clear();
  cy.get('input[name="password"]').clear();
  if (cy.get('input[name="LastName"]')) {
    cy.get('input[name="LastName"]').clear();
  }
};
const clearLoginFields = (cy) => {
  cy.get('input[name="email"]').clear();
  cy.get('input[name="password"]').clear();
};

const clearFields = (cy) => {
  cy.get('input[name="title"]').clear();
  cy.get('input[name="dueDate"]').clear();
};

function formatDateWithOffset(daysOffset = 0) {
  const date = new Date(); // Get the current date
  date.setDate(date.getDate() + daysOffset); // Add or subtract days based on the offset

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FirstName = "Javid";
const LastName = "Sumra";
const email = "test@gmail.com";
const password = "123456789";

describe("WD-401 L4 Testing, first we will verify Signup", () => {
  it("should not create an account with empty email, password, or FirstName", () => {
    cy.visit(studentSubmissionUrl + "/Signup");
    cy.get('input[name="FirstName"]').should("exist");
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");

    clearSignUpFields(cy);

    // Empty FirstName
    cy.get('input[name="email"]').type("test@gmail.com");
    cy.get('input[name="password"]').type("12345678");

    if (cy.get('input[name="LastName"]')) {
      cy.get('input[name="LastName"]').type("Sumra");
    }
    cy.get('input[type="submit"]').click();

    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/Signup");
    });

    // Empty email
    clearSignUpFields(cy);
    cy.get('input[name="FirstName"]').type("Javid");
    cy.get('input[name="password"]').type("12345678");

    if (cy.get('input[name="LastName"]')) {
      cy.get('input[name="LastName"]').type("Sumra");
    }
    cy.get('input[type="submit"]').click();

    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/Signup");
    });

    // Empty password
    clearSignUpFields(cy);
    cy.get('input[name="FirstName"]').type("L10 user");
    cy.get('input[name="email"]').type("l10vta@pupilfirst.com");

    if (cy.get('input[name="LastName"]')) {
      cy.get('input[name="LastName"]').type("User");
    }
    cy.get('input[type="submit"]').click();

    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/Signup");
    });
  });

  it("should visit Signup path and create an account", () => {
    cy.visit(studentSubmissionUrl + "/Signup");
    cy.get('input[name="FirstName"]').should("exist");
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.get('input[name="FirstName"]').type(FirstName);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);

    if (cy.get('input[name="LastName"]')) {
      cy.get('input[name="LastName"]').type(LastName);
    }
    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/todos");
    });
  });
  it("should not login with invalid credentials", () => {
    cy.visit(studentSubmissionUrl + "/");
    clearLoginFields(cy);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("inv@lid");
    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/");
    });
  });
});

describe("Verify the todo list functions properly,", () => {
  beforeEach(() => {
    cy.visit(studentSubmissionUrl + "/");
    clearLoginFields(cy);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[type="submit"]').click();
  });
  it("contains an input field with name attribute `title`", () => {
    cy.get('input[name="title"]').should("exist");
  });
  it("contains an input date field with name attribute `dueDate`", () => {
    cy.get('input[name="dueDate"]').should("exist");
  });
  it("contains a submit input", () => {
    cy.get('input[type="submit"]').should("exist");
  });
  it("contains one element with the given IDs in each of sections Overdue, Due Today, Due Later and Completed to show the count of todos", () => {
    cy.get("#count-overdue").should("be.visible");
    cy.get("#count-due-today").should("be.visible");
    cy.get("#count-due-later").should("be.visible");
    cy.get("#count-completed").should("be.visible");
  });

  it("Should not create a todo item with empty title", () => {
    clearFields(cy);
    cy.get('input[name="dueDate"]').type(formatDateWithOffset(0));
    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.get(".Todo-Item").should("not.exist");
  });
  it("Should not create a todo item with empty dueDate", () => {
    clearFields(cy);
    cy.get('input[name="title"]').type("Sample due today item");
    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.get(".Todo-Item").should("not.exist");
  });

  it("Should create sample due today item", () => {
    clearFields(cy);
    cy.get('input[name="title"]').type("Sample due today item");
    cy.get('input[name="dueDate"]').type(formatDateWithOffset(0));

    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.get(".Todo-Item").should("exist");
    cy.get("#count-due-today").contains("1");
  });

  it("Should create sample due later item", () => {
    clearFields(cy);
    cy.get('input[name="title"]').type("Sample due later item");
    cy.get('input[name="dueDate"]').type(formatDateWithOffset(3));

    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.get(".Todo-Item").should("exist");
    cy.get("#count-due-later").contains("1");
  });
  it("Should create sample overdue item", () => {
    clearFields(cy);
    cy.get('input[name="title"]').type("Sample overdue item");
    cy.get('input[name="dueDate"]').type(formatDateWithOffset(-3));

    cy.get('input[type="submit"]').click();
    cy.wait(500);
    cy.get(".Todo-Item").should("exist");
    cy.get("#count-overdue").contains("1");
  });

  it("Should mark sample overdue item as completed", () => {
    clearFields(cy);
    cy.contains("label", "Sample overdue item").click();
    cy.wait(500);
    cy.get("#count-completed").contains("1");
    cy.contains("label", "Sample overdue item")
      .invoke("attr", "for")
      .then((forAttribute) => {
        // Handle the 'for' attribute value
        cy.get(`#${forAttribute}`).should("be.checked");
      });
  });

  it("Should toggle a completed item to incomplete when clicked on it", () => {
    clearFields(cy);
    cy.contains("label", "Sample overdue item").click();
    cy.wait(500);
    cy.get("#count-completed").contains("0");
    cy.get("#count-overdue").contains("1");
    cy.contains("label", "Sample overdue item")
      .invoke("attr", "for")
      .then((forAttribute) => {
        // Handle the 'for' attribute value
        cy.get(`#${forAttribute}`).should("not.be.checked");
      });
  });

  it("Should have a logout input with text `signout`", () => {
    clearFields(cy);
    cy.contains("signout", { matchCase: false });
  });

  it("Should be able to logout", () => {
    clearFields(cy);
    cy.contains("signout", { matchCase: false }).click({ force: true });
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/");
    });
  });
});
