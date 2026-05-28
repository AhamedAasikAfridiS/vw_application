function toProfile(row) {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toSavedVehicle(row) {
  return {
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function toPreferences(row) {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    budgetMin: row.budget_min === null ? null : Number(row.budget_min),
    budgetMax: row.budget_max === null ? null : Number(row.budget_max),
    favoriteCategory: row.favorite_category,
    preferredDrivetrain: row.preferred_drivetrain,
    colorTheme: row.color_theme,
    newsletterOptIn: row.newsletter_opt_in,
    updatedAt: row.updated_at
  };
}

module.exports = { toProfile, toSavedVehicle, toPreferences };
