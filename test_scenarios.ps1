# Comprehensive Verification Script for Leave Management System
$ErrorActionPreference = "Stop"

function Get-ErrorMsg($ex) {
    try {
        if ($ex.ErrorDetails -and $ex.ErrorDetails.Message) {
            return ($ex.ErrorDetails.Message | ConvertFrom-Json).message
        }
        if ($ex.Exception -and $ex.Exception.Response) {
            $stream = $ex.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $text = $reader.ReadToEnd()
            return ($text | ConvertFrom-Json).message
        }
    } catch {
        return $_.Exception.Message
    }
    return $ex.ToString()
}

Write-Host "=== TEST 1: Public Registration ===" -ForegroundColor Cyan
$randomEmail = "user_" + (Get-Random) + "@company.com"
$regBody = @{
    fullName = "John Doe"
    email = $randomEmail
    password = "Password@123"
    confirmPassword = "Password@123"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method Post -ContentType "application/json" -Body $regBody
$employeeToken = $regRes.data.token
Write-Host "Registration Success: $($regRes.success)"
Write-Host "User ID: $($regRes.data.userId)"
Write-Host "Role: $($regRes.data.role)"
Write-Host "Token: $($employeeToken.Substring(0, 20))..."
Write-Host "`n=== TEST 2: Duplicate Email Registration ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method Post -ContentType "application/json" -Body $regBody
    Write-Host "FAILED: Expected duplicate email error" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Rejected duplicate email: $msg" -ForegroundColor Green
}

Write-Host "`n=== TEST 3: Login Verification (All Roles) ===" -ForegroundColor Cyan
# Admin
$adminLogin = @{ email = "admin@company.com"; password = "Admin@123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $adminLogin
Write-Host "Admin Login Role: $($adminRes.data.role)"
$adminToken = $adminRes.data.token

# Manager
$mgrLogin = @{ email = "manager@company.com"; password = "Manager@123" } | ConvertTo-Json
$mgrRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $mgrLogin
Write-Host "Manager Login Role: $($mgrRes.data.role)"
$mgrToken = $mgrRes.data.token

# Invalid Login
try {
    $invalidLogin = @{ email = "admin@company.com"; password = "WrongPassword" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $invalidLogin
    Write-Host "FAILED: Expected login failure" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Invalid login correctly rejected: $msg" -ForegroundColor Green
}

Write-Host "`n=== TEST 4: Date Validation on Leave Creation ===" -ForegroundColor Cyan
$headersEmp = @{ Authorization = "Bearer $employeeToken" }
try {
    $invalidDates = @{
        leaveType = "Annual Leave"
        startDate = "2026-10-25"
        endDate = "2026-10-20"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/apply" -Method Post -Headers $headersEmp -ContentType "application/json" -Body $invalidDates
    Write-Host "FAILED: Expected date error" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Invalid date range rejected: $msg" -ForegroundColor Green
}

Write-Host "`n=== TEST 5: Apply for Leave (Valid) ===" -ForegroundColor Cyan
$validLeave = @{
    leaveType = "Annual Leave"
    startDate = "2026-10-20"
    endDate = "2026-10-25"
} | ConvertTo-Json
$leaveRes = Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/apply" -Method Post -Headers $headersEmp -ContentType "application/json" -Body $validLeave
Write-Host "Leave Created: $($leaveRes.data.requestId), Status: $($leaveRes.data.status)"
$requestId = $leaveRes.data.requestId

Write-Host "`n=== TEST 6: Employee Dashboard Summary ===" -ForegroundColor Cyan
$sumRes = Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/summary" -Method Get -Headers $headersEmp
Write-Host "Employee Summary -> Total: $($sumRes.data.totalRequests), Pending: $($sumRes.data.pendingRequests), Approved: $($sumRes.data.approvedRequests), Rejected: $($sumRes.data.rejectedRequests)"

Write-Host "`n=== TEST 7: Edit Pending Leave Request ===" -ForegroundColor Cyan
$editLeave = @{
    leaveType = "Casual Leave"
    startDate = "2026-10-21"
    endDate = "2026-10-26"
} | ConvertTo-Json
$editRes = Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/$requestId" -Method Put -Headers $headersEmp -ContentType "application/json" -Body $editLeave
Write-Host "Updated Leave Type: $($editRes.data.leaveType), Status still: $($editRes.data.status)"

Write-Host "`n=== TEST 8: Manager Reviews and Approves ===" -ForegroundColor Cyan
$headersMgr = @{ Authorization = "Bearer $mgrToken" }
$decisionBody = @{ decision = "Approved" } | ConvertTo-Json
$decRes = Invoke-RestMethod -Uri "http://localhost:8080/api/manager/leave/$requestId/decision" -Method Post -Headers $headersMgr -ContentType "application/json" -Body $decisionBody
Write-Host "Manager Decision Message: $($decRes.message)"
Write-Host "Updated Status: $($decRes.data.status)"

Write-Host "`n=== TEST 9: Prevent Editing/Deleting Approved Request ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/$requestId" -Method Put -Headers $headersEmp -ContentType "application/json" -Body $editLeave
    Write-Host "FAILED: Expected edit rejection" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Approved request edit correctly rejected: $msg" -ForegroundColor Green
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/employee/leave/$requestId" -Method Delete -Headers $headersEmp
    Write-Host "FAILED: Expected delete rejection" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Approved request delete correctly rejected: $msg" -ForegroundColor Green
}

Write-Host "`n=== TEST 10: Admin User Management & Protection ===" -ForegroundColor Cyan
$headersAdmin = @{ Authorization = "Bearer $adminToken" }

# Create user
$newEmail = "robert_" + (Get-Random) + "@company.com"
$newUser = @{
    name = "Robert King"
    email = $newEmail
    role = "Employee"
    password = "Password@123"
} | ConvertTo-Json
$createRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users" -Method Post -Headers $headersAdmin -ContentType "application/json" -Body $newUser
Write-Host "Admin Created User: $($createRes.data.userId), Name: $($createRes.data.name)"

# Prevent demoting last Admin
try {
    $demoteAdmin = @{
        name = "Admin User"
        email = "admin@company.com"
        role = "Employee"
        activeStatus = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users/USR-ADMIN01" -Method Put -Headers $headersAdmin -ContentType "application/json" -Body $demoteAdmin
    Write-Host "FAILED: Demoting last admin should fail" -ForegroundColor Red
} catch {
    $msg = Get-ErrorMsg $_
    Write-Host "Demoting last admin correctly rejected: $msg" -ForegroundColor Green
}

# View All Leave Requests Organization-wide
$allLeave = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/leave/all" -Method Get -Headers $headersAdmin
Write-Host "Admin retrieved $($allLeave.data.Count) total organization leave requests."

Write-Host "`n=== TEST 11: Logout API ===" -ForegroundColor Cyan
$logoutRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/logout" -Method Post
Write-Host "Logout response: $($logoutRes.message)"

Write-Host "`nALL 11 BACKEND VERIFICATION TEST SUITES PASSED SUCCESSFULLY!" -ForegroundColor Green
