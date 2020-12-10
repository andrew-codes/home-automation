import paho.mqtt.client as mqtt
import hassapi as hass


class GuestTracker(hass.Hass):

    def initialize(self):
        self.log('Starting Guest Tracker')
        self.log(self.args)
        # self.client = mqtt.Client()
        # self.client.username_pw_set(
        #     self.args["mqtt_username"], password=self.args["mqtt_password"])
        # self.client.on_connect = self.on_connect
        # self.client.on_message = self.on_message
        # self.client.connect(self.args["mqtt_host"], self.args["mqtt_port"], 60)
        # self.client.loop_start()

    def terminate(self):
        self.client.loop_stop()

    def on_connect(self, client, userdata, flags, rc):
        self.log("Connected with result code " + str(rc))
        self.client.publish('/appdaemon/birth', qos=2)
        self.client.subscribe(self.args["topic"])

    def on_message(self, client, userdata, msg):
        self.log(msg.topic+" "+msg.payload.decode())
        groupName = self.args["group_name"]
        groupEntityId = "group." + groupName
        all_entities = self.get_state()
        g = all_entities[groupEntityId]
        self.log(g)
        entity_of_mac = None
        for key, value in all_entities.items():
            if value['attributes'] and 'mac' in value['attributes']:
                if str(value['attributes']['mac']) == msg.payload.decode():
                    entity_of_mac = value

        self.log(g)
        if entity_of_mac is None:
            return

        entity_id = entity_of_mac['entity_id']
        self.log(entity_of_mac)
        group_members = g['attributes']['entity_id']
        new_group_members = list(filter(lambda id: id != entity_id, group_members)) + [
            entity_id]
        self.log('New group members')
        self.log(new_group_members)
        self.call_service('group/set', object_id=groupName,
                          name=g['attributes']['friendly_name'], entities=new_group_members)
        self.log('Guest group members updated')
