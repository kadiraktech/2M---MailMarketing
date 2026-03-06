package com.mailmarketing.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;

    protected String baseUrl() {
        return envOrDefault("APP_BASE_URL", "http://localhost:4200");
    }

    protected String adminEmail() {
        return envOrDefault("ADMIN_EMAIL", "admin@mailmarketing.local");
    }

    protected String adminPassword() {
        return envOrDefault("ADMIN_PASSWORD", "Admin123!");
    }

    @BeforeEach
    void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        String headlessEnv = envOrDefault("HEADLESS", "true");
        boolean isHeadless = !"false".equalsIgnoreCase(headlessEnv);

        if (isHeadless) {
            options.addArguments("--headless=new");
        }

        options.addArguments("--window-size=1920,1080");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(3));
        wait = new WebDriverWait(driver, Duration.ofSeconds(12));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected WebElement waitVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void waitUrlContains(String pathPart) {
        wait.until(ExpectedConditions.urlContains(pathPart));
    }

    protected void open(String relativePath) {
        driver.get(baseUrl() + relativePath);
    }

    protected void loginAsAdmin() {
        open("/admin/login");

        if (!driver.findElements(By.cssSelector("main.admin-content")).isEmpty()
            && driver.findElements(By.cssSelector("input[formcontrolname='email']")).isEmpty()) {
            return;
        }

        WebElement emailInput = waitVisible(By.cssSelector("input[formcontrolname='email'], input[placeholder='E-posta']"));
        emailInput.clear();
        emailInput.sendKeys(adminEmail());

        WebElement passwordInput = waitVisible(By.cssSelector("p-password input, input.p-password-input, input[type='password']"));
        passwordInput.clear();
        passwordInput.sendKeys(adminPassword());

        WebElement submitButton = waitVisible(By.cssSelector("form button.p-button, form button[type='submit'], form button"));
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();

        try {
            waitUrlContains("/admin/dashboard");
        } catch (TimeoutException ex) {
            waitVisible(By.cssSelector("main.admin-content"));
        }
    }

    private String envOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value;
    }
}
