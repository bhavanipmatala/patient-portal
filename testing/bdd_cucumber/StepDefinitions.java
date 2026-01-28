package stepDefinitions;

import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.Assert;

public class StepDefinitions {
    WebDriver driver;

    @Given("the patient is on the login page")
    public void the_patient_is_on_the_login_page() {
        driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");
    }

    @When("the patient enters valid email {string} and password {string}")
    public void the_patient_enters_valid_credentials(String email, String password) {
        driver.findElement(By.name("email")).sendKeys(email);
        driver.findElement(By.name("password")).sendKeys(password);
    }

    @And("clicks the login button")
    public void clicks_the_login_button() {
        driver.findElement(By.tagName("button")).click();
    }

    @Then("the patient should be redirected to the dashboard")
    public void the_patient_should_be_redirected_to_the_dashboard() throws InterruptedException {
        Thread.sleep(2000);
        Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
    }

    @And("see their name {string} displayed")
    public void see_their_name_displayed(String name) {
        Assert.assertTrue(driver.getPageSource().contains(name));
        driver.quit();
    }

    // Additional steps for Messaging scenarios would follow a similar pattern
    @Given("the patient is logged into the portal")
    public void the_patient_is_logged_in() {
        // Implementation for logging in
    }

    @When("the patient navigates to the {string} page")
    public void navigates_to_page(String page) {
        driver.findElement(By.link_text(page)).click();
    }
}
