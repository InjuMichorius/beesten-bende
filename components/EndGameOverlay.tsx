import { Player } from "@/constants/types";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EndGameOverlayProps {
  players: Player[];
  onRestart: () => void;
  onPickNew: () => void;
}

export const EndGameOverlay = ({
  players,
  onRestart,
  onPickNew,
}: EndGameOverlayProps) => {
  // Sorteren op positie
  const sortedByRank = [...players].sort((a, b) => b.pos - a.pos);

  // Podium volgorde (2 - 1 - 3)
  const podium = [
    sortedByRank[1], // Zilver
    sortedByRank[0], // Goud
    sortedByRank[2], // Brons
  ].filter((p) => p !== undefined);

  return (
    <View style={styles.fullScreenOverlay}>
      <View style={styles.mainContent}>
        {/* LINKERKANT: HET PODIUM */}
        <View style={styles.leftColumn}>
          <View style={styles.podiumContainer}>
            {podium.map((player) => {
              const isFirst = player.id === sortedByRank[0]?.id;
              const isSecond = player.id === sortedByRank[1]?.id;

              // Dynamische hoogte op basis van rank
              const blockHeight = isFirst ? 100 : isSecond ? 70 : 50;

              return (
                <View key={`podium-${player.id}`} style={styles.podiumSpot}>
                  <View
                    style={[styles.avatarCircle, isFirst && styles.avatarLarge]}
                  >
                    <Image
                      source={{
                        uri: `https://api.dicebear.com/7.x/bottts/png?seed=${player.name}`,
                      }}
                      style={[
                        styles.avatarImage,
                        isFirst && styles.avatarImageLarge,
                      ]}
                    />
                  </View>
                  <View style={[styles.podiumBlock, { height: blockHeight }]}>
                    <Text style={styles.podiumRankText}>
                      {isFirst ? "1" : isSecond ? "2" : "3"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* RECHTERKANT: DE KAARTEN MET CTA'S */}
        <View style={styles.rightColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sortedByRank.map((p, index) => (
              <View key={p.id} style={styles.playerCard}>
                <Text style={styles.rankLabel}>{index + 1}</Text>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.playerName}>{p.name}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <View
                      style={[
                        styles.avatarSmall,
                        {
                          backgroundColor: index === 0 ? "#fca311" : "#4facfe",
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: `https://api.dicebear.com/7.x/bottts/png?seed=${p.name}`,
                        }}
                        style={styles.avatarImageSmall}
                      />
                    </View>
                    <View
                      style={[styles.badge, index === 0 && styles.badgeActive]}
                    >
                      <Text style={styles.badgeText}>⚡</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>💣</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🎯</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🏹</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🥊</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
              <Text style={styles.btnText}>Opnieuw Spelen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onPickNew}>
              <Text style={styles.exitBtnText}>Andere Spelers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    paddingTop: 40,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row", // Dit zorgt voor de links/rechts splitsing
    paddingHorizontal: 10,
  },

  // Linkerkolom (Podium)
  leftColumn: {
    flex: 0.4, // Neemt 40% van de breedte
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  podiumSpot: {
    alignItems: "center",
    marginHorizontal: 2,
  },
  podiumBlock: {
    width: 160,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },
  avatarLarge: {
    width: 120,
    height: 120,
    marginBottom: 50,
    borderRadius: 60,
    borderColor: "#fca311",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarImageLarge: {
    borderRadius: 22.5,
  },
  podiumRankText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // Rechterkolom (Lijst)
  rightColumn: {
    flex: 0.6, // Neemt 60% van de breedte
    padding: 40,
  },
  playerCard: {
    flexDirection: "row",
    padding: 10,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rankLabel: {
    color: "#666",
    marginRight: 8,
    padding: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    textAlign: "center",
    width: 100,
    alignItems: "center",
  },
  playerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  cardContent: {
    borderWidth: 1,
    borderColor: "#222",
    padding: 10,
    borderRadius: 10,
  },
  deleteBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarImageSmall: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  badgeActive: { backgroundColor: "#fca311" },
  badgeText: { fontSize: 12 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  restartBtn: {
    backgroundColor: "#fca311",
    padding: 12,
    borderRadius: 10,
    flex: 0.6,
    alignItems: "center",
  },
  btnText: { color: "black", fontWeight: "bold" },
  exitBtn: {
    flex: 0.35,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtnText: { color: "#666" },
});
