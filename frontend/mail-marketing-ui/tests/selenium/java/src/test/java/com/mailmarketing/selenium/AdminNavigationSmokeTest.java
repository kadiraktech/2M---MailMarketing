package com.mailmarketing.selenium;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

public class AdminNavigationSmokeTest extends BaseTest {

    @Test
    void adminCanNavigateKeyPages() {
        loginAsAdmin();

        openAndAssert("/admin/subscribers", By.cssSelector("input[formcontrolname='email'], p-table"));
        openAndAssert("/admin/templates", By.cssSelector("quill-editor, p-table"));
        openAndAssert("/admin/send", By.cssSelector("label[for='allSubs'], p-dropdown, .p-dropdown"));
        openAndAssert("/admin/reporting", By.cssSelector("h2.h5, h2"));
    }

    private void openAndAssert(String route, By markerSelector) {
        open(route);
        waitUrlContains(route);
        Assertions.assertFalse(
            driver.findElements(markerSelector).isEmpty(),
            "Expected page marker not found for route: " + route
        );
    }
}
