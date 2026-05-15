export const presets = {
  shopStandard: {
    label: "Shop Standard",
    prompt: `Bearbeite dieses Produktfoto für einen professionellen Onlineshop.
Produkt exakt erhalten. Keine Form verändern. Keine Anschlüsse, Kabel, Schrauben, Stopfen, Stecker oder Bauteile hinzufügen oder entfernen.
Produkt sauber freistellen, reinen weißen Hintergrund setzen, Schatten entfernen, leicht begradigen, Belichtung optimieren, Glanz reduzieren, Metall neutral und natürlich darstellen, technische Details erhalten.
Ergebnis als quadratisches 1:1 Produktbild, Produkt mittig, sauberer technischer Look.`
  },
  technischSauber: {
    label: "Technisch sauber",
    prompt: `Optimiere dieses technische Produktfoto sehr detailgetreu.
Geometrie und Bauteile unverändert lassen. Produkt freistellen, weißen Hintergrund setzen, Kanten sauber darstellen, Belichtung und Kontrast verbessern, leichte Spiegelungen reduzieren, technische Details scharf erhalten.
Keine künstlerische Veränderung, keine erfundenen Bauteile.`
  },
  ohneSchatten: {
    label: "Weiß ohne Schatten",
    prompt: `Produkt exakt unverändert freistellen und auf rein weißen Hintergrund setzen.
Alle Schatten entfernen. Keine Formänderung, keine neuen Elemente, keine Retusche an Anschlüssen oder Geometrie.
Belichtung neutral verbessern und Produkt mittig als 1:1 Shopbild ausgeben.`
  }
};

export type PresetKey = keyof typeof presets;
