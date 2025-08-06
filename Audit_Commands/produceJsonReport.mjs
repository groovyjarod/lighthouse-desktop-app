import fs from 'fs'

const FOLDER_PATH = '../audits/audit-results'

export default function produceJsonReport () {
    const result = []
    let auditData = {}
    let itemCount = 0
    let subItemCount = 0
    let accessibilityScore
    const allAudits = fs.readdirSync(FOLDER_PATH)
    for (let i = 1; i < allAudits.length; i++) {
        const auditRaw = fs.readFileSync(`${FOLDER_PATH}/${allAudits[i]}`, 'utf8')
        const audit = JSON.parse(auditRaw)
        for (const [key, value] of Object.entries(audit)) {
            if (typeof(value) === 'object') {
                for (let itemData of value['items']) {
                    itemCount++
                    for (const [itemKey, itemValue] of Object.entries(itemData)) {
                        if (itemKey === 'subItems') {
                            subItemCount++
                        }
                    }
                }
            } else if (key === 'accessibilityScore') {
                accessibilityScore = value
            }
        }
        const auditLength = auditRaw.split('\n').length
        if (auditLength > 2) {
            auditData['name'] = allAudits[i]
            auditData['itemCount'] = itemCount
            auditData['subItemCount'] = subItemCount
            auditData['score'] = accessibilityScore
            auditData['length'] = auditLength

            console.log(`Audit for ${allAudits[i]}:`)
            console.log(`Item count: ${itemCount}`)
            console.log(`subItem count: ${subItemCount}`)
            console.log('Accessibility Score: ', accessibilityScore)
            console.log(`Number of lines: ${auditLength}`)
            console.log()
        } else {
            auditData['name'] = `Audit failed for ${allAudits[i]}. Please try again.`
        }
        itemCount = 0
        subItemCount = 0
        result.push(auditData)
        auditData = {}
    }
    return result
}

produceJsonReport()