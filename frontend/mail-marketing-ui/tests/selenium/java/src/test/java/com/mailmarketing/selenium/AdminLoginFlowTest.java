package com.mailmarketing.selenium;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

public class AdminLoginFlowTest extends BaseTest {

    @Test
    void adminCanLoginAndShellIsVisible() {
        loginAsAdmin();

        boolean inAdminArea = driver.getCurrentUrl().contains("/admin") && !driver.getCurrentUrl().contains("/admin/login");
        boolean hasNavLinks = !driver.findElements(By.cssSelector("a[href$='/admin/dashboard'], a[href$='/admin/subscribers']")).isEmpty();

        Assertions.assertTrue(inAdminArea || hasNavLinks, "Admin area did not load after login.");
    }
}
