# Location-Based Notification System Documentation

## Overview
This system automatically notifies users within 10km radius when someone posts a lost item near their location using Firebase notifications and MongoDB for location storage.

## How It Works

### 1. **User Location Tracking**
- `LocationTracker` component runs in the background
- Automatically gets user's GPS location on app load
- Updates location in MongoDB every 10 minutes
- Stores GPS as string: `"latitude,longitude"` (e.g., `"6.9271,79.8612"`)

### 2. **Lost Item Posting Flow**
When a user creates a lost item post:

1. Post is saved with GPS location
2. System queries MongoDB for users within 10km radius
3. Uses Haversine formula to calculate precise distances
4. Excludes post creator from notifications
5. Sends Firebase notifications to all nearby users
6. Each notification includes distance from user

### 3. **Notification Details**
Each nearby user receives:
- **Title**: "Lost Item Nearby: [Item Name]"
- **Message**: "Someone lost a [Item] near your location in [District]"
- **Data**:
  - Post ID
  - Category
  - Location
  - Distance (e.g., "5.2 km away")
- **Link**: Direct link to view the post
- **Priority**: Medium

## Technical Implementation

### Database Schema

#### User Model (MongoDB)
```javascript
{
  clerkId: String,      // Unique Clerk user ID
  email: String,        // User email
  photo: String,        // Profile photo
  firstName: String,    // First name
  lastName: String,     // Last name
  gps: String          // NEW: "lat,lng" format
}
```

### Key Functions

#### `updateUserLocation(clerkId, gps)`
Updates user's GPS location in MongoDB.

**Parameters:**
- `clerkId`: Clerk user ID
- `gps`: GPS string "lat,lng"

**Example:**
```javascript
await updateUserLocation('user_123', '6.9271,79.8612');
```

#### `getNearbyUsers(centerGps, radiusKm, excludeClerkId)`
Finds users within specified radius from a GPS point.

**Parameters:**
- `centerGps`: Center point "lat,lng"
- `radiusKm`: Search radius in kilometers (default: 10)
- `excludeClerkId`: User ID to exclude

**Returns:** Array of nearby users with distance info

**Example:**
```javascript
const nearbyUsers = await getNearbyUsers('6.9271,79.8612', 10, 'user_123');
// Returns: [{ clerkId, email, gps, distance: 5.2 }, ...]
```

#### `calculateDistance(gps1, gps2)`
Calculates distance between two GPS coordinates using Haversine formula.

**Returns:** Distance in kilometers

**Example:**
```javascript
const distance = calculateDistance('6.9271,79.8612', '7.2906,80.6337');
// Returns: ~115.2 (km between Colombo and Kandy)
```

## API Endpoints

### Update User Location
```http
POST /api/user/location
Content-Type: application/json

{
  "clerkId": "user_123",
  "gps": "6.9271,79.8612"
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "user": { /* user object */ }
}
```

### Get User Location
```http
GET /api/user/location?clerkId=user_123
```

**Response:**
```json
{
  "clerkId": "user_123",
  "gps": "6.9271,79.8612"
}
```

## React Hook: useUserLocation

### Usage
```javascript
import { useUserLocation } from '@/app/lib/hooks/useUserLocation';

function MyComponent() {
  const { 
    location,           // { lat, lng, gps }
    loading,            // boolean
    error,              // string | null
    getCurrentLocation, // function
    updateLocation      // function
  } = useUserLocation();

  return (
    <div>
      {loading && <p>Getting location...</p>}
      {error && <p>Error: {error}</p>}
      {location && (
        <div>
          <p>Lat: {location.lat}</p>
          <p>Lng: {location.lng}</p>
          <button onClick={getCurrentLocation}>
            Refresh Location
          </button>
        </div>
      )}
    </div>
  );
}
```

## Components

### LocationTracker
Add to your main layout to enable automatic location tracking:

```javascript
import LocationTracker from '@/components/LocationTracker';

export default function Layout({ children }) {
  return (
    <div>
      <LocationTracker />
      {children}
    </div>
  );
}
```

**Features:**
- Runs silently in background
- Gets initial location on mount
- Updates location every 10 minutes
- No UI rendering

## Configuration

### Change Notification Radius
Modify in `lost/route.js`:
```javascript
const nearbyUsers = await getNearbyUsers(postData.gps, 10, creatorClerkId);
//                                                      ^^ Change this (km)
```

### Change Update Interval
Modify in `LocationTracker.jsx`:
```javascript
const interval = setInterval(() => {
  getCurrentLocation();
}, 10 * 60 * 1000); // 10 minutes - modify this
```

### Notification Priority
Change in `lost/route.js`:
```javascript
{
  userId: user.clerkId,
  type: NOTIFICATION_TYPES.ITEM_LOST,
  title: `Lost Item Nearby: ${title}`,
  message: `Someone lost a ${title} near your location in ${District}`,
  priority: 'medium' // Change to 'high' or 'low'
}
```

## Testing

### 1. Test Location Update
```javascript
// In browser console
const response = await fetch('/api/user/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clerkId: 'your_clerk_id',
    gps: '6.9271,79.8612'
  })
});
console.log(await response.json());
```

### 2. Test Nearby Users
Create a lost post and check console logs:
```
Finding nearby users for GPS: 6.9271,79.8612
Found 5 nearby users within 10km
Sent 5 notifications to nearby users
```

### 3. Check Notification Receipt
1. Set your location (User A)
2. Have another user (User B) create a lost post nearby
3. Check User A's notification page
4. Should see notification with distance

## Distance Calculation Example

The Haversine formula calculates distance between two GPS points:

```javascript
// Colombo to Kandy
const colombo = '6.9271,79.8612';
const kandy = '7.2906,80.6337';
const distance = calculateDistance(colombo, kandy);
// Result: ~115 km

// Close by (within 10km)
const location1 = '6.9271,79.8612';
const location2 = '6.9500,79.8700';
const distance = calculateDistance(location1, location2);
// Result: ~3.2 km - User WILL receive notification
```

## Troubleshooting

### Notifications Not Received
1. **Check user has location set:**
   ```javascript
   GET /api/user/location?clerkId=user_id
   ```
   
2. **Verify distance is within 10km:**
   - Check console logs in lost post API
   - "Found X nearby users within 10km"

3. **Check Firebase indexes deployed:**
   ```bash
   firebase firestore:indexes
   ```

### Location Not Updating
1. **Browser permissions:** Ensure location access is allowed
2. **LocationTracker mounted:** Check it's in main layout
3. **Console errors:** Check browser console for errors
4. **API working:** Test `/api/user/location` endpoint

### Distance Calculation Issues
- GPS format must be "lat,lng" (comma-separated)
- Both coordinates must be valid numbers
- Check for null/undefined values

## Best Practices

1. **Privacy:** Only track location with user consent
2. **Battery:** 10-minute interval balances accuracy and battery
3. **Accuracy:** Use `enableHighAccuracy: true` for GPS
4. **Fallback:** Handle cases where user denies location
5. **Caching:** Cache location for 5 minutes to reduce API calls
6. **Error Handling:** Don't fail post creation if notifications fail

## Example Notification Flow

```
User A (Colombo: 6.9271,79.8612) creates lost post
    ↓
System queries MongoDB for users with GPS
    ↓
Finds:
- User B (6.9500,79.8700) - 3.2 km ✅ Within 10km
- User C (7.2906,80.6337) - 115 km ❌ Outside 10km
- User A (creator) - 0 km ❌ Excluded
    ↓
Sends Firebase notification to User B:
{
  title: "Lost Item Nearby: Black Wallet",
  message: "Someone lost a Black Wallet near your location in Colombo",
  distance: "3.2 km away",
  link: "/lost/[post_id]"
}
    ↓
User B sees notification in real-time
```

## Performance Considerations

- **MongoDB Query:** Fetches only users with GPS data
- **Distance Calculation:** Runs in memory (fast)
- **Bulk Notifications:** Sends all notifications at once
- **Non-blocking:** Notification errors don't affect post creation
- **Location Updates:** Only every 10 minutes (not continuous)

## Future Enhancements

- [ ] Allow users to customize notification radius
- [ ] Add "turn off location notifications" setting
- [ ] Show map with nearby lost items
- [ ] Filter notifications by category preference
- [ ] Add distance slider (5km, 10km, 25km)
- [ ] Background location updates (PWA)
- [ ] Location history for better accuracy
