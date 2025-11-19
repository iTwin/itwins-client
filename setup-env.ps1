echo "Fetching secrets from Key Vault and writing to .env file..."
# Get secret names first, then retrieve each value in parallel
$secretNames = az keyvault secret list --vault-name "ItwinsClientKeyVault1" --query "[].name" -o tsv

# Use PowerShell jobs for parallel processing (works in all PowerShell versions)
$jobs = @()
foreach ($secretName in $secretNames) {
    $jobs += Start-Job -ScriptBlock {
        param($name, $vaultName)
        $value = az keyvault secret show --vault-name $vaultName --name $name --query "value" -o tsv
        $transformedName = $name.Replace("-", "_").ToUpper()
        "$transformedName=`"$value`""
    } -ArgumentList $secretName, "ItwinsClientKeyVault1"
}
echo "Fetching $($jobs.Count) env variables..."
# Wait for all jobs to complete and collect results
$envLines = @()
$secretCount = 0
foreach ($job in $jobs) {
    $result = Receive-Job -Job $job -Wait
    $secretCount++
    echo "Processed $secretCount / $($jobs.Count) env variables."
    $envLines += $result
    Remove-Job -Job $job
}

echo "Writing .env file in project root..."
# Write all lines to .env file at once
$envLines | Out-File -FilePath ".env" -Encoding UTF8

echo "Done"