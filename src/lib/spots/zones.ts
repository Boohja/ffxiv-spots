export const expansions = [
  "A Realm Reborn",
  "Heavensward",
  "Stormblood",
  "Shadowbringers",
  "Endwalker",
  "Dawntrail",
] as const;

export type Expansion = (typeof expansions)[number];

export type ZoneMetadata = {
  zone: string;
  region: string;
  expansion: Expansion;
};

export const zoneMetadata = [
  zone("Limsa Lominsa Upper Decks", "La Noscea", "A Realm Reborn"),
  zone("Limsa Lominsa Lower Decks", "La Noscea", "A Realm Reborn"),
  zone("Mist", "La Noscea", "A Realm Reborn"),
  zone("Wolves' Den Pier", "La Noscea", "A Realm Reborn"),
  zone("Middle La Noscea", "La Noscea", "A Realm Reborn"),
  zone("Lower La Noscea", "La Noscea", "A Realm Reborn"),
  zone("Eastern La Noscea", "La Noscea", "A Realm Reborn"),
  zone("Western La Noscea", "La Noscea", "A Realm Reborn"),
  zone("Upper La Noscea", "La Noscea", "A Realm Reborn"),
  zone("Outer La Noscea", "La Noscea", "A Realm Reborn"),

  zone("New Gridania", "The Black Shroud", "A Realm Reborn"),
  zone("Old Gridania", "The Black Shroud", "A Realm Reborn"),
  zone("The Lavender Beds", "The Black Shroud", "A Realm Reborn"),
  zone("Central Shroud", "The Black Shroud", "A Realm Reborn"),
  zone("East Shroud", "The Black Shroud", "A Realm Reborn"),
  zone("South Shroud", "The Black Shroud", "A Realm Reborn"),
  zone("North Shroud", "The Black Shroud", "A Realm Reborn"),

  zone("Ul'dah - Steps of Nald", "Thanalan", "A Realm Reborn"),
  zone("Ul'dah - Steps of Thal", "Thanalan", "A Realm Reborn"),
  zone("The Goblet", "Thanalan", "A Realm Reborn"),
  zone("The Gold Saucer", "Thanalan", "A Realm Reborn"),
  zone("Western Thanalan", "Thanalan", "A Realm Reborn"),
  zone("Central Thanalan", "Thanalan", "A Realm Reborn"),
  zone("Eastern Thanalan", "Thanalan", "A Realm Reborn"),
  zone("Southern Thanalan", "Thanalan", "A Realm Reborn"),
  zone("Northern Thanalan", "Thanalan", "A Realm Reborn"),

  zone("Coerthas Central Highlands", "Coerthas", "A Realm Reborn"),
  zone("Foundation", "Coerthas", "Heavensward"),
  zone("The Pillars", "Coerthas", "Heavensward"),
  zone("The Firmament", "Coerthas", "Heavensward"),
  zone("Empyreum", "Coerthas", "Heavensward"),
  zone("Coerthas Western Highlands", "Coerthas", "Heavensward"),

  zone("Mor Dhona", "Mor Dhona", "A Realm Reborn"),

  zone("The Sea of Clouds", "Abalathia's Spine", "Heavensward"),
  zone("Azys Lla", "Abalathia's Spine", "Heavensward"),

  zone("Idyllshire", "Dravania", "Heavensward"),
  zone("The Dravanian Forelands", "Dravania", "Heavensward"),
  zone("The Dravanian Hinterlands", "Dravania", "Heavensward"),
  zone("The Churning Mists", "Dravania", "Heavensward"),

  zone("Rhalgr's Reach", "Gyr Abania", "Stormblood"),
  zone("The Fringes", "Gyr Abania", "Stormblood"),
  zone("The Peaks", "Gyr Abania", "Stormblood"),
  zone("The Lochs", "Gyr Abania", "Stormblood"),

  zone("Kugane", "Hingashi", "Stormblood"),
  zone("Shirogane", "Hingashi", "Stormblood"),

  zone("The Ruby Sea", "Othard", "Stormblood"),
  zone("Yanxia", "Othard", "Stormblood"),
  zone("The Doman Enclave", "Othard", "Stormblood"),
  zone("The Azim Steppe", "Othard", "Stormblood"),

  zone("The Crystarium", "Norvrandt", "Shadowbringers"),
  zone("Lakeland", "Norvrandt", "Shadowbringers"),
  zone("Eulmore", "Norvrandt", "Shadowbringers"),
  zone("Kholusia", "Norvrandt", "Shadowbringers"),
  zone("Amh Araeng", "Norvrandt", "Shadowbringers"),
  zone("Il Mheg", "Norvrandt", "Shadowbringers"),
  zone("The Rak'tika Greatwood", "Norvrandt", "Shadowbringers"),
  zone("The Tempest", "Norvrandt", "Shadowbringers"),

  zone("Old Sharlayan", "The Northern Empty", "Endwalker"),
  zone("Labyrinthos", "The Northern Empty", "Endwalker"),

  zone("Garlemald", "Ilsabard", "Endwalker"),
  zone("Radz-at-Han", "Ilsabard", "Endwalker"),
  zone("Thavnair", "Ilsabard", "Endwalker"),

  zone("Mare Lamentorum", "The Sea of Stars", "Endwalker"),
  zone("Ultima Thule", "The Sea of Stars", "Endwalker"),

  zone("Elpis", "The World Unsundered", "Endwalker"),

  zone("Urqopacha", "Yok Tural", "Dawntrail"),
  zone("Kozama'uka", "Yok Tural", "Dawntrail"),
  zone("Yak T'el", "Yok Tural", "Dawntrail"),
  zone("Tuliyollal", "Yok Tural", "Dawntrail"),

  zone("Shaaloani", "Xak Tural", "Dawntrail"),
  zone("Heritage Found", "Xak Tural", "Dawntrail"),
  zone("Solution Nine", "Xak Tural", "Dawntrail"),

  zone("Living Memory", "Unlost World", "Dawntrail"),

  zone("Gangos", "Ilsabard", "Shadowbringers"),
  zone("The Omphalos", "The Sea of Stars", "Endwalker"),
  zone("Unnamed Island", "The Northern Empty", "Endwalker"),
] satisfies ZoneMetadata[];

export const zonesByName = new Map(zoneMetadata.map((metadata) => [metadata.zone, metadata]));

export function getZoneMetadata(zoneName: string) {
  const metadata = zonesByName.get(zoneName);

  if (!metadata) {
    throw new Error(`Unknown FFXIV zone: ${zoneName}`);
  }

  return metadata;
}

function zone(zoneName: string, region: string, expansion: Expansion): ZoneMetadata {
  return {
    zone: zoneName,
    region,
    expansion,
  };
}
