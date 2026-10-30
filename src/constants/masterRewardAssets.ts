/**
 * Thrivefold Master Asset Treasury & Complete Visual Registry.
 * Contains all 37 custom-generated 3D renders, vouchers, medallions, posters,
 * composite splits, and editorial gouache artworks created for Thrivefold.
 */

export interface MasterArtifact {
  id: string;
  title: string;
  category:
    | 'Cinematic Banners'
    | 'Reliquary Chests'
    | 'Collector Cards'
    | 'Currencies & Tokens'
    | 'Physical Gear'
    | 'Gouache Art';
  description: string;
  source: any;
  aspectRatio?: number;
}

export const MASTER_GENERATED_ARTIFACTS: MasterArtifact[] = [
  // 1. Cinematic Banners & Promotional Posters
  {
    id: 'cinematic_macro_opening',
    title: 'Cinematic Macro Opening Banner',
    category: 'Cinematic Banners',
    description: 'Volumetric cinematic lighting of the treasure chest eruption with floating crystals and golden sunbeams.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/wide_cinematic_high_detail_fantasy_ui_promotiona.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'promo_cricket_poster',
    title: 'Junior Cricket & Gear Studio Poster',
    category: 'Cinematic Banners',
    description: 'Commercial product photography poster of handcrafted junior willow cricket bat and leather ball.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_polished_hyper_realistic_product_promo_poster_c.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'vibrant_quest_arena',
    title: 'Vibrant Wellness Quest Arena',
    category: 'Cinematic Banners',
    description: 'Warm, dynamic game-style keyframe showcasing active quest rewards and golden embers.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_vibrant_high_detail_fantasy_game_style_cinemati.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'nordic_living_infographic',
    title: 'Nordic Japanese Wellness Living Infographic',
    category: 'Cinematic Banners',
    description: 'Warm cozy lifestyle overview highlighting sustainable habits, hydration, and mindful rest.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_warm_premium_cozy_product_ad_style_infographi.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'chroma_composite_suite',
    title: 'Chroma Composite Master Suite',
    category: 'Cinematic Banners',
    description: 'Wide composite studio render of multi-tier chests and tokens isolated on green chroma key.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/wide_clean_composite_image_on_a_bright_chroma_key.png'),
    aspectRatio: 2.0,
  },
  {
    id: 'dual_state_burst_composite',
    title: 'Dual-State Chest Burst Composite',
    category: 'Cinematic Banners',
    description: 'Split composite graphic showing closed anticipation and explosive open states side by side.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/wide_split_composite_graphic_on_a_bright_solid_gre.png'),
    aspectRatio: 2.0,
  },
  {
    id: 'studio_render_split',
    title: 'Studio Render Split Perspective',
    category: 'Cinematic Banners',
    description: 'Wide studio lighting render showing faceted reliquary panels and floating tokens.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/wide_split_composite_studio_render_image_on_a_sol.png'),
    aspectRatio: 2.0,
  },
  {
    id: 'split_panel_illumination',
    title: 'Split Panel Illumination Keyframe',
    category: 'Cinematic Banners',
    description: 'High-detail split-panel lighting study of radiant amber beams escaping from chest seams.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_bright_highly_detailed_3d_render_split_panel_co.png'),
    aspectRatio: 2.0,
  },
  {
    id: 'chroma_cutout_silhouette',
    title: 'Clean Chroma Cutout Silhouette',
    category: 'Cinematic Banners',
    description: 'Razor-sharp cutout render designed for alpha transparency layering on mobile screens.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_png_style_render_on_a_solid_bright_green_c.png'),
    aspectRatio: 2.0,
  },

  // 2. Reliquary Chests & Vaults
  {
    id: 'beechwood_relic_chest_3d',
    title: 'Handcrafted Beechwood Relic Chest',
    category: 'Reliquary Chests',
    description: 'Scandinavian beechwood with brushed matte brass corners and debossed Thrivefold T-leaf emblem.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_loot_chest_illustration_on_a.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'obsidian_slate_monolith_3d',
    title: 'Obsidian Slate Monolith Relic',
    category: 'Reliquary Chests',
    description: 'Futuristic monolithic cube forged from dark slate with glowing vein-like jade circuitry.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_sci_fi_3d_render_on_a_trans.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'pulsing_jade_core_vault',
    title: 'Pulsing Jade Core Vault',
    category: 'Reliquary Chests',
    description: 'Open configuration of the Ecosystem Relic Box revealing a levitating emerald power core.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_sci_fi_3d_render_on_a_transp.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'ecosystem_relic_gyro',
    title: 'Ecosystem Relic Gyro Plinth',
    category: 'Reliquary Chests',
    description: 'Central amber gyro spherical lock with high-precision mechanical combination dial.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_dramatic_high_detail_3d_rendered_sci_fi_fantasy.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'high_gloss_obsidian_vault',
    title: 'High-Gloss Obsidian Vault Chamber',
    category: 'Reliquary Chests',
    description: 'Mirror-polished black obsidian facets with laser-etched sacred geometry line work.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_gloss_ultra_detailed_fantasy_sci_fi_style.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'terracotta_vault_mechanism',
    title: 'Hexagonal Terracotta Vault Mechanism',
    category: 'Reliquary Chests',
    description: 'Smooth terracotta ceramic with oxidized copper trims and sage-green vent exhausts.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_game_style_3d_render_on_a_tr.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'sunburst_trove_3d',
    title: 'Champagne Gold Sunburst Trove',
    category: 'Reliquary Chests',
    description: 'Octagonal gold reliquary with frosted ivory glass panels and celestial sunburst rays.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_gaming_ui_style_render_of_a.png'),
    aspectRatio: 1.5,
  },

  // 3. Collector Cards
  {
    id: 'card_apex_thrivemaster_3d',
    title: 'Apex Thrivemaster Royal Card (3D)',
    category: 'Collector Cards',
    description: 'Tier 5 Mythic collector card made of polished black obsidian with 24k mirror gold foil inlay.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_fantasy_collectible_card_style_i.png'),
    aspectRatio: 0.67,
  },
  {
    id: 'card_mindful_voyager_3d',
    title: 'Mindful Voyager Astrolabe Card (3D)',
    category: 'Collector Cards',
    description: 'Tier 3 Epic collector card featuring an astrolabe compass and morning sun motif.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_detailed_fantasy_collectible_card_style_illustra.png'),
    aspectRatio: 0.67,
  },

  // 4. Currencies, Tokens & Medallions
  {
    id: 'imperial_gold_emblem',
    title: 'Imperial Thrivefold Gold Star Emblem',
    category: 'Currencies & Tokens',
    description: 'Royal wellness medallion featuring a sacred geometry flower with embedded amber gem.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_fantasy_luxe_golden_emblem_pro.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'epic_achievement_medallion',
    title: 'Epic Habit Achievement Medallion',
    category: 'Currencies & Tokens',
    description: 'High-relief heraldic medallion rewarding 30-day consistent habit streaks.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_epic_fantasy_medallion_ui_style_ach.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'bronze_habit_medallion',
    title: 'High-Relief Bronze Habit Medallion',
    category: 'Currencies & Tokens',
    description: 'Solid commemorative bronze medallion celebrating consistent mindfulness adherence.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_richly_detailed_high_quality_fantasy_medallion.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'sanctuary_guardian_shield',
    title: 'Polished Sanctuary Guardian Shield',
    category: 'Currencies & Tokens',
    description: 'Interlocking silver and sage-green rings inside an embossed coat of arms.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_polished_fantasy_medieval_ui_st.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'celestial_sunburst_brooch',
    title: 'Glossy Celestial Sunburst Brooch',
    category: 'Currencies & Tokens',
    description: 'Faceted champagne diamond brooch capturing morning solar energy.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_glossy_cinematic_fantasy_achie.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'mythic_star_gold_crystal',
    title: 'Mythic Eight-Point Star Gold Crystal',
    category: 'Currencies & Tokens',
    description: 'Radiant eight-pointed gold gemstone with mirror-polished crystal facets.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_game_icon_magical_artifac.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'cinematic_minted_gold_coin',
    title: 'Cinematic Minted Golden Marketplace Token',
    category: 'Currencies & Tokens',
    description: 'Heavy commemorative token coin forged from 5 Sanctuary Tickets.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_cinematic_3d_rendered_golden.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'booster_2x_jade_talisman',
    title: '2X Habit XP Booster Jade Talisman',
    category: 'Currencies & Tokens',
    description: 'Translucent sage jade glass speed talisman with an embedded floating golden flame.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_resolution_graphic_design_style_transpare.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'ornate_golden_voucher',
    title: 'Ornate Golden Health Booking Voucher',
    category: 'Currencies & Tokens',
    description: 'Letterpress luxury passport voucher with guilloche security line patterns.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_detailed_ornate_golden_framed_voucher_illustra.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'sanctuary_passport_seal',
    title: 'Sanctuary Passport Seal Badge',
    category: 'Currencies & Tokens',
    description: 'Perforated luxury ticket stub stamped with a shimmering gold-foil Thrivefold monogram.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_medieval_game_style_promoti.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'brand_emblem_square',
    title: 'Minimalist Terracotta T-Leaf Seal',
    category: 'Currencies & Tokens',
    description: 'Pure geometric tree trunk with twin sage leaf arch in warm terracotta and cream.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/image(20261030-114841).png'),
    aspectRatio: 1.0,
  },

  // 5. Physical Gear & Studio Product Renders
  {
    id: 'precision_gyroball_render',
    title: 'Precision Mechanical Gyroball',
    category: 'Physical Gear',
    description: 'Autostart metal wrist exerciser with smoked polycarbonate shell and bronze rotor.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_isolated_product_style_3d_render_on_a_tran.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'beechwood_parallettes_studio',
    title: 'Handcrafted Beechwood Pushup Bars',
    category: 'Physical Gear',
    description: 'Solid Scandinavian beechwood parallettes with non-slip natural rubber feet.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_studio_product_render_style_scene_a_singl.png'),
    aspectRatio: 1.0,
  },
  {
    id: 'pushup_bars_profile',
    title: 'Beechwood Parallettes Profile View',
    category: 'Physical Gear',
    description: 'Laser-engraved geometric T-leaf mark on smooth satin-finished natural beechwood.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_high_resolution_ultra_detailed_3d_render.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'linen_journal_isometric',
    title: 'Linen Health & Reflection Journal',
    category: 'Physical Gear',
    description: 'Luxury thick A5 hardcover journal bound in sage-green bookcloth with copper page edges.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_high_resolution_graphic_illustration_on_a.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'knurled_hand_gripper',
    title: 'Heavy Knurled Aluminum Hand Gripper',
    category: 'Physical Gear',
    description: 'Aluminum alloy hand gripper with knurled non-slip handles and black steel torsion spring.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_high_resolution_3d_render_illustration_of.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'junior_cricket_bat',
    title: 'Junior English Willow Cricket Set',
    category: 'Physical Gear',
    description: 'Handcrafted junior willow cricket bat with chevron rubber grip and natural leather ball.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_3d_render_on_a_pure_bright_green_c.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'marble_master_trophy',
    title: 'Solid Carrara Marble Master Trophy',
    category: 'Physical Gear',
    description: 'Sculpted Carrara marble achievement plinth with 24k gold leaf debossed inlay.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_isolated_transparent_background_d.png'),
    aspectRatio: 1.5,
  },
  {
    id: 'nordic_wellness_still_life',
    title: 'Nordic Japanese Wellness Still Life',
    category: 'Physical Gear',
    description: 'Curated studio composition of natural beechwood, raw terracotta, and sage linen.',
    source: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_resolution_ultra_detailed_3d_render_illust.png'),
    aspectRatio: 1.5,
  },
];

