const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'ca'];
const messagesDir = path.join(__dirname, 'messages');

const widgetsToFlatten = ['themesWidget', 'sentimentWidget'];

locales.forEach(locale => {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
        if (fs.existsSync(filePath)) {
            let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Navigate to Dashboard.Overview.Widgets
            if (content.Dashboard && content.Dashboard.Overview && content.Dashboard.Overview.Widgets) {
                const widgets = content.Dashboard.Overview.Widgets;

                widgetsToFlatten.forEach(widgetKey => {
                    if (widgets[widgetKey] && typeof widgets[widgetKey] === 'object') {
                        const title = widgets[widgetKey].title;
                        const subtitle = widgets[widgetKey].subtitle;

                        // Replace object with string title
                        widgets[widgetKey] = title;
                        // Add subtitle as separate key
                        widgets[`${widgetKey}_subtitle`] = subtitle;

                        console.log(`Flattened ${widgetKey} in ${locale}.json`);
                    }
                });

                fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
            }
        }
    } catch (error) {
        console.error(`Error updating ${locale}.json:`, error);
    }
});
