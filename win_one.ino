
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "DJAWEB";
const char* password = "wifibahloul";

const char* mqtt_server = "m16.cloudmqtt.com";

const char *mqtt_user = "fchlyhyo";
const char *mqtt_pass = "88Y3R_KV7BMT";

#include <DHT.h>

#define dht_apin D5

#define DHTTYPE    DHT11
DHT dht(dht_apin, DHTTYPE);


WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

void setup_wifi() {
  WiFi.mode(WIFI_STA);
  delay(100);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    String clientId = "ESP8266Client";
    //clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
    } else {
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  if(!strcmp(topic,"alive")){
    client.publish("here","ESP8266Client");
  }
}

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 15142);
  client.setCallback(callback);
  reconnect();
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }

  client.loop();
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  delay(1000);
  String hh = String(h);
  String msg = String(t);

  int numt = t;
  char cstr[16];
  itoa(numt, cstr, 10);

  int numh = h;
  char cshr[16];
  itoa(numh, cshr, 10);

  delay(1500);
  client.publish("ESP8266Client", cstr);
  delay(10000);

}
