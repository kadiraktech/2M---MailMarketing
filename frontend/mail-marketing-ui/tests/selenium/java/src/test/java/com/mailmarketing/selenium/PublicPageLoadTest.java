package com.mailmarketing.selenium;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

public class PublicPageLoadTest extends BaseTest {

    @Test
    void subscribePageShouldLoadAndShowHeroTitle() {
        open("/subscribe");

        String heading = waitVisible(By.cssSelector("h1.hero-title")).getText();
        Assertions.assertTrue(
            heading.contains("MailMarketing"),
            "Subscribe page hero heading was not visible."
        );
    }
}
