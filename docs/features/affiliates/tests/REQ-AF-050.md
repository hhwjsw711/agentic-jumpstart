# Test Scenario: REQ-AF-050 - Real-time Code Validation

## Requirement
**REQ-AF-050**: Validate affiliate codes against database in real-time

## Test Scenario

### Prerequisites
- Application is running locally (`npm run dev`)
- Multiple test affiliates exist with different statuses
- Network monitoring tools available (browser DevTools)
- Database access for verification

### Test Setup
```sql
-- Create test affiliates with different statuses
INSERT INTO app_affiliate (userId, affiliateCode, paymentLink, commissionRate, isActive) VALUES
(991, 'ACTIVE01', 'https://paypal.me/active1', 30, true),
(992, 'INACTIVE1', 'https://paypal.me/inactive1', 30, false),
(993, 'VALID123', 'https://paypal.me/valid123', 30, true);
```

### Test Steps

1. **Access Validation Interface**
   - Navigate to `http://localhost:3000/purchase`
   - Click "Get Instant Access" to open discount dialog
   - Open browser DevTools Network tab

2. **Test Valid Active Code**
   - Enter "ACTIVE01" in discount code field
   - Click "Apply 10% Discount" button
   - Monitor network activity in DevTools

3. **Verify Real-time Validation Call**
   - Confirm API call to `validateAffiliateCodeFn` is made
   - Check request payload contains `{ code: "ACTIVE01" }`
   - Verify response time is under 1 second
   - Confirm response is `{ valid: true }`

4. **Test Invalid Code**
   - Clear input and enter "INVALID99"
   - Click "Apply 10% Discount" button
   - Monitor network call and response

5. **Test Inactive Code**
   - Clear input and enter "INACTIVE1"
   - Click "Apply 10% Discount" button
   - Verify it's treated as invalid

6. **Test Database Query**
   - Verify the validation function queries the database correctly:
   ```sql
   -- This query should be executed by validateAffiliateCodeUseCase
   SELECT * FROM app_affiliate 
   WHERE affiliateCode = 'ACTIVE01' AND isActive = true;
   ```

### Expected Results

- ✅ Real-time API calls are made for each validation attempt
- ✅ Valid active codes return `{ valid: true }`
- ✅ Invalid or inactive codes return `{ valid: false }`
- ✅ Validation completes within 1 second
- ✅ UI updates immediately based on validation result
- ✅ No client-side caching of validation results

### Network Analysis

1. **Request Verification**
   - Method: POST
   - Endpoint: `/fn/validateAffiliateCodeFn`
   - Content-Type: application/json
   - Payload: `{ data: { code: "TEST_CODE" } }`

2. **Response Verification**
   - Status: 200 OK
   - Content-Type: application/json
   - Body: `{ valid: boolean }`

3. **Performance Metrics**
   - Response time: < 1000ms
   - No unnecessary retry attempts
   - Proper error handling for network failures

### Database Validation

1. **Query Execution**
   - Verify database is queried for each validation
   - Confirm only active affiliates are considered valid
   - Check case-insensitive matching if implemented

2. **Index Performance**
   - Verify `affiliateCode` index is used for fast lookups
   - Check query execution time in database logs

### Edge Cases to Test

1. **Rapid Consecutive Validations**
   - Enter multiple codes quickly in sequence
   - Each should trigger separate validation calls
   - Previous validations should not interfere with new ones

2. **Special Characters**
   - Test codes with spaces: " ACTIVE01 "
   - Test with different cases: "active01", "Active01"
   - Verify proper handling and normalization

3. **Empty and Null Values**
   - Submit empty string
   - Should show validation error before API call

4. **Network Interruption**
   - Simulate network failure during validation
   - Should show appropriate error message
   - User should be able to retry

5. **Concurrent Validations**
   - Open multiple browser tabs
   - Validate different codes simultaneously
   - Each should work independently

### Performance Tests

1. **Response Time Under Load**
   - Validate codes rapidly in sequence
   - Average response time should remain under 1 second

2. **Database Connection Handling**
   - Multiple validations should not exhaust connections
   - Proper connection pooling should be maintained

### Security Tests

1. **SQL Injection Prevention**
   - Try codes like "'; DROP TABLE app_affiliate; --"
   - Should be safely handled by parameterized queries

2. **Rate Limiting**
   - Attempt excessive validation requests
   - System should handle gracefully

### Cleanup
```sql
-- Remove test affiliates after testing
DELETE FROM app_affiliate WHERE affiliateCode IN ('ACTIVE01', 'INACTIVE1', 'VALID123');
```

### Related Components
- Server Function: `validateAffiliateCodeFn` (`/src/fn/affiliates.ts`)
- Use Case: `validateAffiliateCodeUseCase` (`/src/use-cases/affiliates.ts`)
- Database: `app_affiliate` table
- UI Component: `DiscountDialog` (`/src/components/discount-dialog.tsx`)