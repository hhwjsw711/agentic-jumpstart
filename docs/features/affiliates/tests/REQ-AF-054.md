# Test Scenario: REQ-AF-054 - Memory-Only Code Storage

## Requirement
**REQ-AF-054**: Store discount codes in memory only during checkout session

## Test Scenario

### Prerequisites
- Application is running locally (`npm run dev`)
- Browser DevTools available for storage inspection
- Test affiliate code available for testing
- Understanding of GDPR compliance requirements

### Test Steps

1. **Verify No Persistent Storage Initially**
   - Open browser DevTools
   - Navigate to Application > Storage
   - Check Local Storage: should be empty of affiliate codes
   - Check Cookies: should contain no affiliate-related cookies
   - Check Session Storage: should be empty of affiliate codes

2. **Capture Affiliate Code from URL**
   - Navigate to `http://localhost:3000/purchase?ref=TEST1234`
   - Verify page loads and code is captured
   - Re-check all browser storage locations

3. **Verify Memory-Only Storage**
   - Confirm no affiliate code appears in:
     - localStorage
     - sessionStorage
     - document.cookie
     - IndexedDB
   - Code should only exist in JavaScript memory (DiscountStore)

4. **Test Code Persistence During Session**
   - Navigate to `http://localhost:3000/purchase?ref=TEST1234`
   - Click "Get Instant Access" to open dialog
   - Verify code is pre-filled (proving it's in memory)
   - Close dialog
   - Click purchase button again
   - Code should still be pre-filled

5. **Test Memory Clearing on Page Refresh**
   - Navigate to page with affiliate code
   - Verify code is captured in memory
   - Refresh the page (F5 or Ctrl+R)
   - If URL still contains ?ref parameter, code should be re-captured
   - If URL doesn't contain parameter, memory should be empty

6. **Test Memory Clearing on Navigation**
   - Navigate to `http://localhost:3000/purchase?ref=TEST1234`
   - Navigate to different page (e.g., `/learn`)
   - Navigate back to `/purchase` (without ?ref parameter)
   - Memory should be cleared, no code pre-filled

7. **Test Browser Tab Isolation**
   - Open first tab: `http://localhost:3000/purchase?ref=FIRST123`
   - Open second tab: `http://localhost:3000/purchase?ref=SECOND456`
   - Each tab should have independent memory storage
   - Codes should not interfere with each other

### Expected Results

- ✅ No affiliate codes stored in any browser persistent storage
- ✅ Codes exist only in JavaScript memory during session
- ✅ Memory is cleared on page refresh without URL parameter
- ✅ Memory is cleared on navigation away from purchase page
- ✅ Each browser tab maintains independent memory state
- ✅ GDPR compliance: no personal data persisted without consent

### Technical Validation

1. **DiscountStore Implementation**
   ```typescript
   // Verify this implementation stores only in memory
   class DiscountStore {
     private discountCode: string | null = null;
     // No browser storage APIs used
   }
   ```

2. **No Browser Storage APIs**
   - Code should not call `localStorage.setItem()`
   - Code should not call `sessionStorage.setItem()`
   - Code should not call `document.cookie = ...`
   - Code should not use any persistent storage mechanisms

3. **Memory State Verification**
   ```javascript
   // In browser console, after navigation with ?ref parameter
   // This should work (accessing memory store)
   window.discountStore?.getDiscountCode(); // Should return the code
   
   // But these should be empty
   localStorage.getItem('affiliateCode'); // null
   sessionStorage.getItem('affiliateCode'); // null
   ```

### Browser Storage Inspection

1. **Local Storage Check**
   - DevTools > Application > Local Storage
   - Should show no affiliate-related keys
   - Should not contain: `affiliateCode`, `discountCode`, `ref`

2. **Session Storage Check**
   - DevTools > Application > Session Storage
   - Should be empty of affiliate data
   - No temporary affiliate storage

3. **Cookies Check**
   - DevTools > Application > Cookies
   - Should contain no affiliate tracking cookies
   - Previous cookie-based system should be removed

4. **IndexedDB Check**
   - DevTools > Application > IndexedDB
   - Should not contain affiliate data

### GDPR Compliance Tests

1. **No Data Persistence Without Consent**
   - User visits affiliate link
   - No data should be stored persistently
   - Data only exists in memory for current session

2. **Data Minimization**
   - Only necessary data (affiliate code) is stored
   - No additional user information is captured
   - Storage duration is minimal (session only)

3. **User Control**
   - User can close browser to clear all data
   - No data survives browser restart
   - User doesn't need to "opt out" of storage

### Performance Tests

1. **Memory Usage**
   - Multiple affiliate codes should not cause memory leaks
   - Memory should be efficiently managed
   - No excessive memory consumption

2. **State Management**
   - Memory store should be responsive
   - Code retrieval should be instantaneous
   - No performance degradation over time

### Security Tests

1. **Cross-Tab Isolation**
   - Affiliate codes in one tab don't affect others
   - No shared state between tabs
   - Privacy protection between sessions

2. **Memory Protection**
   - Code should not be accessible via browser extensions
   - Should not be exposed in global scope unnecessarily
   - Proper encapsulation maintained

### Edge Cases

1. **Browser Refresh Scenarios**
   - Refresh with ?ref parameter: re-capture code
   - Refresh without parameter: clear memory
   - Back/forward navigation: proper state management

2. **Multiple Code Changes**
   - Navigate with one code, then another
   - Memory should update to latest code
   - No accumulation of old codes

3. **Invalid Codes**
   - Invalid codes should still be stored in memory
   - Validation happens separately from storage
   - Memory store is agnostic to code validity

### Browser Compatibility

1. **Memory Management Across Browsers**
   - Chrome: Proper memory isolation
   - Firefox: Consistent behavior
   - Safari: Same memory-only approach
   - Edge: Compatible implementation

2. **JavaScript Engine Differences**
   - V8, SpiderMonkey, JavaScriptCore compatibility
   - Consistent memory management behavior

### Migration Verification

1. **Legacy Cookie Removal**
   - Verify old cookie-based system is completely removed
   - No remnant `affiliateCode` cookies
   - No localStorage from previous implementation

2. **Clean Implementation**
   - No hybrid storage approaches
   - Pure memory-only implementation
   - No fallback to persistent storage

### Related Components
- Store: `DiscountStore` (`/src/stores/discount-store.ts`)
- Route: Purchase page (`/src/routes/purchase.tsx`)
- Component: `DiscountDialog` (`/src/components/discount-dialog.tsx`)

### Compliance Documentation
- GDPR Article 25: Data protection by design and by default
- GDPR Article 5: Principles of data minimization
- No cookies policy for affiliate tracking