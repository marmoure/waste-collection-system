#include <DHT.h>
#include <WiFiEspClient.h>
#include <WiFiEsp.h>
#include <WiFiEspUdp.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>

#define WIFI_AP "DJAWEB_R"
#define WIFI_PASSWORD "NOUSSA004"

const char* mqtt_server = "m16.cloudmqtt.com";

const char *mqtt_user = "fchlyhyo";
const char *mqtt_pass = "88Y3R_KV7BMT";
// DHT
#define DHTPIN 4
#define DHTTYPE DHT11


// Initialize the Ethernet client object
WiFiEspClient espClient;

// Initialize DHT sensor.
DHT dht(DHTPIN, DHTTYPE);

PubSubClient client(espClient);

SoftwareSerial soft(2, 3); // RX, TX

int status = WL_IDLE_STATUS;
unsigned long lastSend;

void setup() {
  // initialize serial for debugging
  Serial.begin(9600);
  dht.begin();
  InitWiFi();
  client.setServer(mqtt_server, 15142);
  client.setCallback(callback);
  lastSend = 0;
}

void loop() {
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

  if ( millis() - lastSend > 10000 ) { // Update and send only after 1 seconds
    getAndSendTemperatureAndHumidityData();
    lastSend = millis();
  }
  client.loop();
}

void getAndSendTemperatureAndHumidityData()
{
  Serial.println("Collecting temperature data.");

  // Reading temperature or humidity takes about 250 milliseconds!
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
  }else 
  {
      String temperature = String(t);
  String humidity = String(h);

  // Prepare a JSON payload string
  String payload = "{";
  payload += "\"temperature\":";
  payload += temperature; payload += ",";
  payload += "\"humidity\":"; 
  payload += humidity;
  payload += "}";


  char attributes[100];
  payload.toCharArray( attributes, 100 );
  client.publish( "arduino uno", attributes );
  Serial.println( attributes );
    
  }

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
  if(!strcmp(topic,"alive")){
    client.publish("here","arduinoUno");
  }
}
