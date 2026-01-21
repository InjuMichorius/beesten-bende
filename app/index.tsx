import { FontAwesome6 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SetupScreen() {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  const addPlayer = () => {
    if (name.trim()) {
      setPlayers([
        ...players,
        { id: Date.now().toString(), name: name.trim() },
      ]);
      setName("");
    }
  };

  const isInputEmpty = name.trim().length === 0;
  const canStartGame = players.length >= 2;

  const startGame = () => {
    if (canStartGame) {
      router.push({
        pathname: "/game",
        params: { players: JSON.stringify(players) },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* LINKERPANEEL */}
        <View style={styles.leftPanelContainer}>
          <ScrollView
            style={styles.leftPanel}
            contentContainerStyle={styles.leftPanelContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarGrid}>
              {players.map((player) => (
                <View key={player.id} style={styles.playerContainer}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{
                        uri: `https://api.dicebear.com/7.x/bottts/png?seed=${player.name}`,
                      }}
                      style={styles.avatar}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* RECHTERPANEEL – TAP = KEYBOARD WEG */}
        <Pressable style={styles.rightPanel} onPress={Keyboard.dismiss}>
          <View>
            <Text style={styles.sidebarTitle}>Speler toevoegen</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Naam..."
                placeholderTextColor="#444"
                onSubmitEditing={() => {
                  if (!isInputEmpty) addPlayer();
                }}
                blurOnSubmit={false}
                returnKeyType="done"
                enablesReturnKeyAutomatically
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.iconButton,
                  !isInputEmpty && styles.iconButtonActive,
                ]}
                onPress={addPlayer}
                disabled={isInputEmpty}
              >
                <FontAwesome6
                  name="user-plus"
                  size={18}
                  color={isInputEmpty ? "#444" : "white"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.startBtn,
                canStartGame ? styles.startBtnActive : styles.startBtnInactive,
              ]}
              disabled={!canStartGame}
              onPress={startGame}
            >
              <Text
                style={[
                  styles.startBtnText,
                  { color: canStartGame ? "white" : "#444" },
                ]}
              >
                Spel starten
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanelContainer: {
    flex: 1,
  },
  leftPanel: {
    flex: 1,
  },
  leftPanelContent: {
    padding: 20,
    paddingBottom: 100,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 25,
  },
  playerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  playerName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    width: 100,
    textAlign: "center",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A8E6CF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
  avatar: {
    width: 80,
    height: 80,
  },
  rightPanel: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: "#1a1a1a",
    padding: 25,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  sidebarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#222",
  },
  iconButton: {
    width: 55,
    height: 55,
    marginLeft: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonActive: {
    borderColor: "white",
    backgroundColor: "#1a1a1a",
  },
  actionsContainer: {
    width: "100%",
  },
  startBtn: {
    height: 75,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  startBtnInactive: {
    borderColor: "#222",
  },
  startBtnActive: {
    borderColor: "white",
  },
  startBtnText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
