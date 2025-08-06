import fs from 'fs'
import createReport from './Audit_Logic/createFinalizedReport.mjs'

const [,, url, outputFile, testing_method, user_agent, viewport] = process.argv

if (!url || !outputFile) {
    console.error("usage: node runAndWriteAudit.mjs <url> <outputFile>")
    process.exit(1)
}

async function getReportData(url, testing_method, user_agent, viewport) {
    try {
        const returnData = await createReport(url, testing_method, user_agent, viewport)
        return returnData
    } catch (err) {
        console.error(`In runAndWriteAudit / getReportData: ${err}`)
        return { accessibilityScore: 0, error: err }
    }
}

try {
    const jsonData = await getReportData(url, testing_method, user_agent, viewport)
    const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    if (parsedData.accessibilityScore > 0) {
        fs.writeFileSync(outputFile, JSON.stringify(parsedData, null, 2), 'utf8')
        console.log('Audit complete.')
    } else {
        console.log('Audit incomplete.')
    }
} catch (err) {
    console.error(`In runAndWriteAudit: Audit failed for ${url}:`, err.message)
    process.exit(1)
}