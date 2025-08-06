import runLighthouse from './generateChromeAudit.mjs'
import generatePuppeteerAudit from './generatePuppeteerAudit.mjs'
import trimAuditData from './trimAuditData.mjs'
import classifyIssue from './classifyIssue.mjs'

// run lighthouse and return data as json object
async function getRawAuditData (urlPath, testing_method, user_agent, viewport) {
    const [rawResults, accessibilityScore] = await generatePuppeteerAudit(urlPath, testing_method, user_agent, viewport)
    return accessibilityScore === 0 ? [null, 0] : [rawResults, accessibilityScore]
}

// retrieve json object and return object with relevant data
async function getAuditAccessibilityData (urlPath, testing_method, user_agent, viewport) {
    const [auditResults, accessibilityScore] = await getRawAuditData(urlPath, testing_method, user_agent, viewport)
    return accessibilityScore === 0 ? [null, 0] : [trimAuditData(auditResults), accessibilityScore]
}

// extract relevant data
async function organizeData(urlPath, testing_method, user_agent, viewport) {
    const [rawResultsData, accessibilityScore] = await getAuditAccessibilityData(urlPath, testing_method, user_agent, viewport)
    if (accessibilityScore === 0) return { accessibilityScore: 0 }

    const initialJsonReport = {}
    let itemCount = 0
    initialJsonReport.accessibilityScore = accessibilityScore
    rawResultsData.forEach((item, index) => {
        const {id, title, description, items} = item
        const newItems = []
        for (let itemData of items) {
            const newItem = {
                snippet: itemData.snippet,
                selector: itemData.selector,
                explanation: itemData.explanation,
                boundingRect: itemData.boundingRect,
                itemCategory: classifyIssue(itemData.selector, itemData.path || '')
            }
            if (itemData.subItems && itemData.subItems.items) {
                const newSubItems = itemData.subItems.items.map(subItem => ({
                    snippet: subItem.relatedNode?.snippet,
                    selector: subItem.relatedNode?.selector,
                    boundingRect: subItem.relatedNode?.boundingRect,
                    nodeLabel: subItem.relatedNode?.nodeLabel,
                    subItemCategory: classifyIssue(subItem.relatedNode?.selector, subItem.relatedNode?.path || '')
                }))
                newItem.subItems = newSubItems
            }
            newItems.push(newItem)
        }
        itemCount++
        initialJsonReport[`${id}-${index+1}`] = {title, description, items: newItems}
    })
    initialJsonReport['number-of-Items'] = itemCount
    const finalizedJsonReport = JSON.stringify(initialJsonReport, null, 2)
    return finalizedJsonReport
}

// default function that invokes all others
export default async function createReport(urlPath, testing_method, user_agent, viewport) {
    const dataToWrite = await organizeData(urlPath, testing_method, user_agent, viewport)
    return dataToWrite
}