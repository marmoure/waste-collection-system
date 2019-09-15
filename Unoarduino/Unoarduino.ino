#include <Servo.h>
#include <DHT.h>
#include <WiFiEspClient.h>
#include <WiFiEsp.h>
#include <WiFiEspUdp.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <HCSR04.h>

//ultra sonic
#define LENGTH 35
UltraSonicDistanceSensor distanceSensor(13, 12);  // Initialize sensor that uses digital pins 13 and 12.

//pir
int PIRInterrupt = 8;
volatile byte State = LOW;
unsigned long lastDebounceTime = 0;  
unsigned long debounceDelay = 15000;
int enabled = 0;

//servo
Servo myservo; 
#define OPENCAP 60
#define CLOSEDCAP 145
int pos = 0;  

//wifi
SoftwareSerial soft(2, 3); // RX, TX
#define WIFI_AP "DJAWEB_R"
#define WIFI_PASSWORD "NOUSSA004"
const char* mqtt_server = "m16.cloudmqtt.com";
const char *mqtt_user = "fchlyhyo";
const char *mqtt_pass = "88Y3R_KV7BMT";
WiFiEspClient espClient;
PubSubClient client(espClient);
int status = WL_IDLE_STATUS;
unsigned long lastSend;
unsigned long lastCalcTime = 0;  
unsigned long CalcDelay = 20000;

//dht
#define DHTPIN 7
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup () {
      Serial.begin(9600);  // We initialize serial connection so that we could print values from sensor.
      dht.begin();
  InitWiFi();
  client.setServer(mqtt_server, 15142);
  client.setCallback(callback);
  lastSend = 0;
      pinMode(LED_BUILTIN, OUTPUT);
   pinMode(PIRInterrupt, INPUT);
}

void loop () {
  //dettecting motion and openning the lid
  if(State == LOW && digitalRead(PIRInterrupt) == 1)
  {
      Serial.println("motion");
            digitalWrite(LED_BUILTIN, HIGH); 
      State = HIGH; 
      lastDebounceTime = millis(); 
      myservo.attach(9);
      open_cap();
      delay(3000);
      close_cap();
      myservo.detach();
  }else if(State == HIGH && (millis() - lastDebounceTime) > debounceDelay)
  {
     digitalWrite(LED_BUILTIN, LOW); 
     State = LOW;
  }

  //wifi part and mqtt
  status = WiFi.status();
  if ( status != WL_CONNECTED) {
    while ( status != WL_CONNECTED) {
      Serial.print("Attempting to connect to WPA SSID: ");
      Serial.println(WIFI_AP);
      // Connect to WPA/WPA2 network
      status = WiFi.begin(WIFI_AP, WIFI_PASSWORD);
      delay(500);
    }
    Serial.println("Connected to AP");
  }

  if ( !client.connected() ) {
    reconnect();
  }
  if ( millis() - lastSend > 15000 ) { // Update and send only after 1 seconds
    getAndSendData();
    lastSend = millis();
  }
  client.loop();

}


void getAndSendData()
{
  int tempDefect = 0;
  int distDefect = 0;
  
  Serial.println("Collecting data.");
  String tempData = "";
  // Reading temperature or humidity takes about 250 milliseconds!
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    tempData="none";
    distDefect = 1;
  }else 
  {
  String temperature = String(t);
  String humidity = String(h);
  
  tempData = "\"temperature\":";
  tempData += temperature; 
  tempData += ",";
  tempData += "\"humidity\":"; 
  tempData += humidity;
  tempData += ",";
  
  }

  int distance = distanceSensor.measureDistanceCm();
  int full = (int)distance/LENGTH;
  full*= 100;
  full -= 100;
  String fullStr = String(full);
// Prepare a JSON payload string
  String payload = "{";
  payload += "\"id\":\"arduino\",\"data\":{";
  payload += tempData;
  payload += "\"full\":"; 
  payload += fullStr;
  payload += ",";
  payload += "\"lat\":"; 
  payload += "36.084196";
  payload += ",";
  payload += "\"long\":"; 
  payload += "7.258657";
  if(tempDefect == 1) {
    payload += ",";
    payload += "\"defect\":";
    payload += "\"temp\"";
  }
  payload += "}}";


  char attributes[300];
  payload.toCharArray( attributes, 300 );
  client.publish( "update", attributes );
  Serial.println( attributes );
    
}


void InitWiFi()
{
  // initialize serial for ESP module
  soft.begin(9600);
  // initialize ESP module
  WiFi.init(&soft);
  // check for the presence of the shield
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }

  Serial.println("Connecting to AP ...");
  // attempt to connect to WiFi network
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(WIFI_AP);
    // Connect to WPA/WPA2 network
    status = WiFi.begin(WIFI_AP, WIFI_PASSWORD);
    delay(500);
  }
  Serial.println("Connected to AP");
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    // Attempt to connect (clientId, username, password)
    if ( client.connect("arduinoUno", mqtt_user, mqtt_pass) ) {
      Serial.println( "[DONE]" );
      client.subscribe("pirEnable");
      client.subscribe("pirDisable");
    } else {
      Serial.print( "[FAILED] [ rc = " );
      Serial.print( client.state() );
      Serial.println( " : retrying in 5 seconds]" );
      // Wait 5 seconds before retrying
      delay( 5000 );
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  if(!strcmp(topic,"pirEnable")){
    enabled = 1;
    client.publish( "pir", "enabled" );
  }
  if(!strcmp(topic,"pirDisable")){
    enabled = 0;
    client.publish( "pir", "off" );
  }
}


void open_cap() {
  for (pos = CLOSEDCAP; pos >= OPENCAP; pos -= 1) { // goes from 0 degrees to 180 degrees
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(25);
  }
}

void close_cap() {
   for (pos = OPENCAP; pos <= CLOSEDCAP; pos += 1) { // goes from 180 degrees to 0 degrees
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(25);                       // waits 15ms for the servo to reach the position
  }
}
