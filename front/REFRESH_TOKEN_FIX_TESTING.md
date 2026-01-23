# Refresh Token "Malformed" Error Fix - Testing Guide

## ✅ Implementation Completed

All three phases have been successfully implemented:

### Phase 1: Enhanced Debugging ✅
- **File**: `src/lib/api/client.ts`
- localStorage structure detailed logging
- Token validation logging (segments, length, whitespace check)
- Request body logging before sending
- Enhanced error response logging

### Phase 2: Root Cause Fix ✅
- **File**: `src/hooks/useAuth.ts`
- Automatic localStorage structure validation and migration
- JWT format validation (3 segments)
- Auto-clear corrupted tokens

### Phase 3: User Experience ✅
- **File**: `src/app/(auth)/login/LoginPageClient.tsx`
- Session expiry message display
- Auto-redirect to login with parameters

---

## 🧪 Testing Instructions

### Test 1: Check localStorage Migration (Automatic on App Load)

1. Open browser DevTools → Console
2. Run this code to corrupt localStorage:
   ```javascript
   localStorage.setItem('auth-storage', '{"refreshTokenValue": "invalid_token"}');
   ```
3. Refresh the page
4. Check console for migration logs:
   ```
   [Auth Migration] Invalid localStorage structure, migrating...
   [Auth Migration] Migration completed successfully
   ```

### Test 2: Check Token Validation Logging

1. **Login to the application**
2. Open browser DevTools → Console
3. Wait for session to expire OR manually expire the access token:
   ```javascript
   // In console
   const authData = JSON.parse(localStorage.getItem('auth-storage'));
   authData.state.accessToken = 'expired_token';
   localStorage.setItem('auth-storage', JSON.stringify(authData));
   ```
4. Make an API call (navigate to any page)
5. **Expected Console Logs**:
   ```
   [Token Refresh] Starting token refresh process...
   [Token Refresh] Store state: { hasRefreshToken: true, ... }
   [Token Refresh] Token validation details: {
     tokenLength: 123,
     segments: 3,
     firstSegmentLength: 36,
     hasWhitespace: false,
     hasBearerPrefix: false,
     ...
   }
   [Token Refresh] Request body to be sent: {
     operationId: "LoginRefresh",
     refreshTokenLength: 123,
     refreshTokenSegments: 3,
     ...
   }
   ```

### Test 3: Check Invalid Token Detection

1. Open DevTools → Console
2. Set an invalid refresh token (wrong number of segments):
   ```javascript
   const authData = JSON.parse(localStorage.getItem('auth-storage'));
   authData.state.refreshTokenValue = 'invalid.token'; // Only 2 segments
   localStorage.setItem('auth-storage', JSON.stringify(authData));
   ```
3. Make an API call
4. **Expected Behavior**:
   - Console error: `[Token Refresh] Invalid JWT format: { segments: 2, ... }`
   - Auto-logout
   - Redirect to login page with session expiry message

### Test 4: Check Session Expiry Message

1. Navigate to: `http://localhost:3000/login?expired=true&reason=token_invalid`
2. **Expected**: Yellow alert box displaying "세션이 만료되었습니다. 다시 로그인해주세요."

3. Navigate to: `http://localhost:3000/login?expired=true&reason=token_refresh_failed`
4. **Expected**: Yellow alert box displaying "인증 정보 갱신에 실패했습니다. 다시 로그인해주세요."

### Test 5: Check localStorage Structure After Login

1. Login to the application
2. Open DevTools → Application → Local Storage
3. Check `auth-storage` key
4. **Expected Structure**:
   ```json
   {
     "state": {
       "isAuthenticated": true,
       "accessToken": "eyJ...",
       "refreshTokenValue": "eyJ...",
       "user": {...}
     },
     "version": 0
   }
   ```

### Test 6: Diagnose Current Issue (For User Reporting Error)

If a user reports the malformed token error, ask them to run this in console:

```javascript
// Check localStorage structure
const authStorage = localStorage.getItem('auth-storage');
console.log('=== DIAGNOSTIC INFO ===');
console.log('Raw localStorage:', authStorage?.substring(0, 200));

const parsed = JSON.parse(authStorage);
console.log('Has state property:', !!parsed?.state);
console.log('State keys:', Object.keys(parsed?.state || {}));

const refreshToken = parsed?.state?.refreshTokenValue;
console.log('Refresh token exists:', !!refreshToken);
console.log('Refresh token type:', typeof refreshToken);
console.log('Refresh token length:', refreshToken?.length);
console.log('Refresh token segments:', refreshToken?.split('.').length);
console.log('Token preview:', refreshToken?.substring(0, 50) + '...');
console.log('Has whitespace:', /\s/.test(refreshToken || ''));
console.log('Has Bearer prefix:', refreshToken?.startsWith('Bearer '));
console.log('======================');
```

### Test 7: Network Tab Verification

1. Open DevTools → Network tab
2. Trigger a token refresh (wait for expiry or force it)
3. Find the `/api/auth/refresh` request
4. Click on it → Payload tab
5. **Check**:
   - `request.refresh_token` exists
   - Token has 3 parts separated by dots (eyJ...eyJ...abc)
   - No "Bearer " prefix
   - No extra whitespace

---

## 🐛 Expected Fixes

### Problem: "token is malformed: token contains an invalid number of segments"

**Root Cause**: localStorage had wrong structure or corrupted token

**How Fixed**:
1. ✅ Auto-migration validates and fixes localStorage structure on app load
2. ✅ Pre-validation of JWT format before sending to server
3. ✅ Auto-clear corrupted tokens with user-friendly error message
4. ✅ Detailed logging to identify exact cause

### Enhanced Logging Will Show:

- Exact localStorage structure
- Token format validation results
- Token segments count
- Presence of whitespace or Bearer prefix
- Request payload before sending
- Server error response details

---

## 🚀 Server Status

✅ **Development server is running on http://localhost:3000**

You can now:
1. Open the app in your browser
2. Test the login flow
3. Check console logs for detailed debugging information
4. Verify the fixes are working correctly

---

## 📝 Next Steps

1. **Test in development**: Follow the testing instructions above
2. **Monitor logs**: When the error occurs, detailed logs will show the exact cause
3. **Share diagnostics**: If issue persists, run Test 6 and share the console output
4. **Verify fix**: The enhanced validation should prevent malformed tokens from being sent

---

## 🔍 Key Improvements

### Before:
- ❌ No localStorage structure validation
- ❌ Fallback to wrong property path
- ❌ Limited error logging
- ❌ No user-friendly error messages

### After:
- ✅ Automatic localStorage validation and migration
- ✅ Strict Zustand persist structure (`state.refreshTokenValue` only)
- ✅ Pre-validation of JWT format (3 segments)
- ✅ Comprehensive logging at every step
- ✅ Auto-clear corrupted data
- ✅ User-friendly session expiry messages
- ✅ Detailed error information for debugging

---

## 📞 Support

If you encounter any issues:
1. Check the console logs for detailed error information
2. Run the diagnostic script (Test 6)
3. Check Network tab for request/response details
4. Share the console output for further analysis
