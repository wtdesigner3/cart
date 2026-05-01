export const parseCsv = (csvText) => {
  const rows = csvText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rows.length === 0) return []

  const headerRow = rows[0]
  const headers = headerRow
    .split(',')
    .map((header) => header.trim().replace(/^"|"$/g, ''))

  return rows.slice(1).map((row) => {
    const values = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < row.length; i += 1) {
      const char = row[i]
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const item = {}
    headers.forEach((header, index) => {
      item[header] = values[index] ?? ''
    })
    return item
  })
}
