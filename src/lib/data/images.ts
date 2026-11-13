/** Builds an Unsplash image URL from a photo id. */
export function unsplash(id: string, width = 900, height?: number): string {
  const crop = height ? `&h=${height}` : "";
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}${crop}&q=80`;
}

/**
 * 100% Inanimate product-only photography (clothing items, jackets, jeans/pants,
 * hoodies/jerseys, shirts, hangers, flat lays, and garment racks).
 * No real human beings or model faces.
 */
export const photo = {
  // T-Shirts & Tops (flat lays, hangers, folded stacks)
  whiteTee: "1521572163474-6864f9cf17ab", // folded white tee
  whiteTeeDetail: "1529374255404-311a2a4f1fd9", // white tee collar/fabric detail
  blackTeeHanger: "1583743814966-8936f5b7be1a", // black tee on wooden hanger
  blackTeeBadge: "1618354691373-d851c5c3a990", // black minimal tee flat lay
  retroTee: "1576566588028-4147f3842f27", // retro graphic tee flat lay
  foldedTees: "1562157873-818bc0726f68", // neat stack of folded tees
  rackTees: "1489987707025-afc232f7ea0f", // t-shirts hanging on rack
  graphicTeeWoman: "1618354691373-d851c5c3a990", // graphic tee flat lay (product only)
  womanWhiteTee: "1521572163474-6864f9cf17ab", // folded clean white tee
  womanBlackTee: "1583743814966-8936f5b7be1a", // black tee on hanger
  manWhiteTee: "1562157873-818bc0726f68", // folded tees bundle

  // Shirts & Tailored / Formal (hangers, rails)
  dressShirt: "1598033129183-c4f50c736f10", // crisp formal dress shirt on hanger
  denimShirt: "1596755094514-f87e34085b2c", // denim shirt on wooden hanger
  greenShirts: "1523381210434-271e8be1f52b", // collared shirts on rail
  checkSuit: "1598033129183-c4f50c736f10", // formal tailored shirt on hanger
  navySuit: "1598033129183-c4f50c736f10", // tailored buttoned shirt on hanger

  // Jeans & Trousers / Pants (folded, flat lays, store shelves)
  jeansLevis: "1542272604-787c3835535d", // classic denim jeans folded
  flatlayJeans: "1525507119028-ed4c629a60a3", // flat lay jeans & sneakers
  lightJeans: "1602293589930-45aad59ba3ab", // light wash denim jeans flat lay
  rippedJeans: "1541099649105-f69ad21f3246", // ripped blue jeans flat lay
  jeansStore: "1560243563-062bfc001d68", // denim jeans stacks on wooden shelf
  stripedTrousers: "1525507119028-ed4c629a60a3", // trousers / pants flat lay
  femaleJeans: "1542272604-787c3835535d", // denim trousers folded

  // Hoodies, Sweatshirts & Jerseys (flat lays, hangers)
  greyHoodie: "1556821840-3a63f95609a7", // grey hoodie flat lay
  redHoodie: "1548126032-079a0fb0099d", // red fleece hoodie
  whiteSweatshirt: "1620799140408-edc6dcb6d633", // white crew sweatshirt flat lay
  orangeSweater: "1578587018452-892bacefd3f2", // orange knit sweater flat lay
  yellowTracksuit: "1620799140408-edc6dcb6d633", // fleece jersey sweatshirt flat lay

  // Jackets & Outerwear (hangers, racks)
  leatherJacket: "1551028719-00167b16eac5", // black leather biker jacket
  bomberJacket: "1591047139829-d91aecb6caea", // bomber jacket on hanger
  camelBlazer: "1591047139829-d91aecb6caea", // jacket on hanger
  plaidCoat: "1485968579580-b6d095142e6e", // plaid coat on hanger
  coatsRack: "1604644401890-0bd678c83788", // winter coats on rack
  blueCoatHijab: "1604644401890-0bd678c83788", // coats on rack
  denimJacketWoman: "1596755094514-f87e34085b2c", // denim jacket on hanger

  // Knitwear, Dresses & Sets (hangers, rails, flat lays)
  knitPoncho: "1558769132-cb1aea458c5e", // knitwear on wooden rail
  knitRail: "1558769132-cb1aea458c5e", // sweaters on rail
  redDress: "1490481651871-ab68de25d43d", // garments on wooden hangers
  denimDress: "1596755094514-f87e34085b2c", // denim dress/shirt on hanger
  jumpsuit: "1544441893-675973e31985", // flat lay outfit

  // Store & Flat Lay Displays
  flatlayOutfit: "1544441893-675973e31985", // complete flat lay outfit
  beanieJeans: "1556905055-8f358a7a47b2", // accessories & jeans flat lay
  whiteHangers: "1490481651871-ab68de25d43d", // clothing on wooden hangers
  clothesRail: "1512436991641-6745cdb1723f", // clothes rail in store
  boutique: "1445205170230-053b83016050", // boutique racks
  store: "1441984904996-e0b6ba687e04", // store display
} as const;
