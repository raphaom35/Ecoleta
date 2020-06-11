import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Text,
  View,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import api from "../../services/api";
import * as Location from "expo-location";
interface Item {
  id: number;
  name: string;
  image_url: string;
}
interface Points {
  id: number;
  name: string;
  image: string;
  latitude: string;
  longitude: string;
}
interface Params {
  uf: string;
  city: string;
}
const Points = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [points, setPoints] = useState<Points[]>([]);
  const [selectdItens, setselectdItens] = useState<number[]>([]);
  const [initialPosition, setinitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const route = useRoute();
  const routeParams = route.params as Params;
  const navigation = useNavigation();

  useEffect(() => {
    api.get("items").then((response) => {
      setItens(response.data);
    });
  }, []);
  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Oooops....",
          "Precisammos da sua permissão para obtera loaclização"
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setinitialPosition([latitude, longitude]);
    }
    loadPosition();
  }, []);
  useEffect(() => {
    api
      .get("points", {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: selectdItens,
        },
      })
      .then((response) => {
        setPoints(response.data);
      });
  }, [selectdItens]);
  function handleNavigationback() {
    navigation.goBack();
  }
  function handleNavigationToDatail(id: number) {
    navigation.navigate("Detail", { point_id: id });
  }
  function handleSelectetItens(id: number) {
    const alredySelected = selectdItens.findIndex((item) => item === id);
    if (alredySelected >= 0) {
      const filterItens = selectdItens.filter((item) => item !== id);
      setselectdItens(filterItens);
    } else {
      setselectdItens([...selectdItens, id]);
    }
  }
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigationback}>
          <Feather name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Bem vindo</Text>
        <Text style={styles.description}>
          Emcontre no mapa um ponto de coleta
        </Text>
        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              loadingEnabled={initialPosition[0] === 0}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
            >
              {points.map((point) => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigationToDatail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage}
                      source={{
                        uri: point.image,
                      }}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {itens.map((iten) => (
            <TouchableOpacity
              key={String(iten.id)}
              style={[
                styles.item,
                selectdItens.includes(iten.id) ? styles.selectedItem : {},
              ]}
              onPress={() => handleSelectetItens(iten.id)}
              activeOpacity={0.6}
            >
              <SvgUri uri={iten.image_url} width={42} height={42} />
              <Text style={styles.itemTitle}>{iten.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});
export default Points;
