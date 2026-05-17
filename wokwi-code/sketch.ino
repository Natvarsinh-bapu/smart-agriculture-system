#include <DHT.h>
#include <HardwareSerial.h>
#include <HTTPClient.h>
#include <WiFi.h>

#define DHTPIN 15
#define DHTTYPE DHT22
#define LDR_PIN 4
#define MOISTURE_PIN 5
#define ncom 3

char commar[ncom] = {0x01, 0x03, 0x05};
uint8_t rtValue[ncom];

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);

  WiFi.begin("Wokwi-GUEST", "");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
  
  Serial2.begin(15200, SERIAL_8N1, 16, 17);
  dht.begin();
  delay(3000);
}

void loop() {
  // ===== DHT22 =====
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("DHT FAILED");
  } else {
    Serial.print("Temp: ");
    Serial.print(t);
    Serial.println(" °C");

    Serial.print("Humidity: ");
    Serial.print(h);
    Serial.println(" %");
  }

  // MOISTURE
  int moistureValue = analogRead(MOISTURE_PIN);
  Serial.print("Moisture: ");
  Serial.println(moistureValue);

  // ===== NPK SENSOR =====
  for (uint8_t i = 0; i < ncom; i++) {

    // send command
    Serial2.print((char)commar[i]);
    delay(50);

    // wait for response
    unsigned long start = millis();
    while (!Serial2.available()) {
      if (millis() - start > 500) break;
    }

    if (Serial2.available()) {
      rtValue[i] = Serial2.read();
    } else {
      rtValue[i] = 0;
    }
  }

  // print results
  Serial.print("Nitrogen (N): ");
  Serial.println(rtValue[0]);

  Serial.print("Phosphorous (P): ");
  Serial.println(rtValue[1]);

  Serial.print("Potassium (K): ");
  Serial.println(rtValue[2]);

  // ===== LDR =====
  int lightValue = analogRead(LDR_PIN);
  Serial.print("Light Level: ");
  Serial.println(lightValue);

  // convert to percentage (0–100)
  int lightPercent = map(lightValue, 0, 4095, 0, 100);

  Serial.print("Light %: ");
  Serial.print(lightPercent);
  Serial.println("%");

  Serial.println("----------------------");

  // update in firebase
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    String url = "https://smart-agriculture-78e45-default-rtdb.firebaseio.com/sensorData.json";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"temperature\":" + String(t) + ",";
    jsonData += "\"humidity\":" + String(h) + ",";
    jsonData += "\"lightLevel\":" + String(lightValue) + ",";
    jsonData += "\"lightPercentage\":" + String(lightPercent) + ",";
    jsonData += "\"moisture\":" + String(moistureValue) + ",";
    jsonData += "\"nitrogen\":" + String(rtValue[0]) + ",";
    jsonData += "\"phosphorus\":" + String(rtValue[1]) + ",";
    jsonData += "\"potassium\":" + String(rtValue[2]);
    jsonData += "}";

    int response = http.POST(jsonData);

    Serial.print("HTTP Response: ");
    Serial.println(response);

    http.end();
  }

  delay(5000);
}