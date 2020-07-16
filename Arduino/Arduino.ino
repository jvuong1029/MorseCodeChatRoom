/*
    References:
    https://learn.adafruit.com/circuit-playground-lesson-number-0/buttons-slide-switch
    https://www.arduino.cc/en/tutorial/debounce
*/

#include <Adafruit_CircuitPlayground.h>

// Variables will change:
int buttonState1; // the current reading from the input pin
int buttonState2;
int lastButtonState1 = LOW; // the previous reading from the input pin
int lastButtonState2 = LOW;

// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastDebounceTime1 = 0; // the last time the output pin was toggled
unsigned long lastDebounceTime2 = 0;
unsigned long debounceDelay = 50; // the debounce time; increase if the output flickers

void setup(void)
{
    CircuitPlayground.begin();
    Serial.begin(9600);

    while (!Serial)
    {
        ; // wait for serial port to connect. Needed for native USB port only
    }
}

void loop(void)
{
    // read the state of the switch into a local variable:
    int reading1 = CircuitPlayground.leftButton();  // dot, true if pressed
    int reading2 = CircuitPlayground.rightButton(); // dash

    // check to see if you just pressed the button
    // (i.e. the input went from LOW to HIGH), and you've waited long enough
    // since the last press to ignore any noise:

    // If the switch changed, due to noise or pressing:
    if (reading1 != lastButtonState1)
        lastDebounceTime1 = millis(); // reset the debouncing timer
    if (reading2 != lastButtonState2)
        lastDebounceTime2 = millis();

    if ((millis() - lastDebounceTime1) > debounceDelay)
    {
        // whatever the reading is at, it's been there for longer than the debounce
        // delay, so take it as the actual current state:

        // if the button state has changed:
        if (reading1 != buttonState1)
        {
            buttonState1 = reading1;

            if (buttonState1 == HIGH && CircuitPlayground.slideSwitch())
                Serial.println(".");
            else if (buttonState1 == HIGH && !CircuitPlayground.slideSwitch())
                Serial.println("space");
        }
    }
    if ((millis() - lastDebounceTime2) > debounceDelay)
    {
        if (reading2 != buttonState2)
        {
            buttonState2 = reading2;

            if (buttonState2 == HIGH && CircuitPlayground.slideSwitch())
                Serial.println("-");
            else if (buttonState2 == HIGH && !CircuitPlayground.slideSwitch())
                Serial.println("help");
        }
    }

    // save the reading. Next time through the loop, it'll be the lastButtonState1:
    lastButtonState1 = reading1;
    lastButtonState2 = reading2;

    // set the LED:
    CircuitPlayground.strip.clear();
    if (buttonState1 == HIGH && CircuitPlayground.slideSwitch())
        CircuitPlayground.strip.setPixelColor(2, 0xFFA500); // orange
    else if (buttonState1 == HIGH && !CircuitPlayground.slideSwitch())
        for (int i = 0; i < 10; i++)
            CircuitPlayground.strip.setPixelColor(i, 0xFFA500); // orange
    else if (buttonState2 == HIGH && CircuitPlayground.slideSwitch())
        for (int i = 6; i < 9; i++)
            CircuitPlayground.strip.setPixelColor(i, 0xFFA500); // orange
    else if (buttonState2 == HIGH && !CircuitPlayground.slideSwitch())
        for (int i = 0; i < 10; i++)
            CircuitPlayground.strip.setPixelColor(i, 0xFF0000); // red
    CircuitPlayground.strip.show();

    delay(10);
}
