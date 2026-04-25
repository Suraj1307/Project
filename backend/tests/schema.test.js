const test = require("node:test");
const assert = require("node:assert/strict");

const {
  listingSchema,
  reviewSchema,
  userSchema,
  loginSchema,
} = require("../schema");
const { validateObjectId } = require("../middleware");
const escapeRegex = require("../utils/escapeRegex");

test("listing schema accepts valid listing payload", () => {
  const { error } = listingSchema.validate({
    listing: {
      title: "Beach House",
      description: "A lovely stay near the sea with enough detail.",
      location: "Goa",
      country: "India",
      price: 1200,
      category: "Trending",
      maxGuests: 4,
      amenities: ["WiFi", "Pool"],
      image: "",
    },
  });

  assert.equal(error, undefined);
});

test("review schema rejects comments that are too short", () => {
  const { error } = reviewSchema.validate({
    review: {
      rating: 5,
      comment: "bad",
    },
  });

  assert.ok(error);
});

test("listing schema rejects invalid categories", () => {
  const { error } = listingSchema.validate({
    listing: {
      title: "Beach House",
      description: "A lovely stay near the sea with enough detail.",
      location: "Goa",
      country: "India",
      price: 1200,
      category: "Beach",
      maxGuests: 4,
      amenities: ["WiFi"],
      image: "",
    },
  });

  assert.ok(error);
});

test("user schema requires a strong-enough password", () => {
  const { error } = userSchema.validate({
    username: "suraj",
    email: "suraj@example.com",
    password: "short",
  });

  assert.ok(error);
});

test("login schema requires both fields", () => {
  const { error } = loginSchema.validate({
    username: "suraj",
  });

  assert.ok(error);
});

test("escapeRegex escapes regex control characters", () => {
  assert.equal(escapeRegex("goa.*(india)"), "goa\\.\\*\\(india\\)");
});

test("validateObjectId rejects malformed ids", () => {
  const middleware = validateObjectId("id", "Listing");

  assert.throws(
    () => middleware({ params: { id: "not-a-valid-id" } }, {}, () => {}),
    /Listing not found\./
  );
});

test("validateObjectId allows valid ids", () => {
  const middleware = validateObjectId("id", "Listing");
  let nextCalled = false;

  middleware({ params: { id: "507f1f77bcf86cd799439011" } }, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});
