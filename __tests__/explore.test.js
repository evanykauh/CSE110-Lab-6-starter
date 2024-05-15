const puppeteer = require('puppeteer');

describe('Notes App E2E Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.goto('http://127.0.0.1:5500/index.html'); // Adjust path as necessary
    });

    afterAll(async () => {
        await browser.close();
    });

    // Test to check if a new note can be added
    it('Add Note', async () => {
        console.log('Adding a new note...');
        await page.click('.add-note');
        const noteCount = await page.$$eval('.note', (notes) => notes.length);
        expect(noteCount).toBe(1);
    }, 25000);

    // Test to check if a note's content can be updated
    it('Update Note', async () => {
        console.log('Updating a note...');
        await page.click('.add-note');
        const noteElement = await page.$('.note');
        await noteElement.type('Updated Note Content');
        const noteContent = await page.evaluate(() => document.querySelector('.note').value);
        expect(noteContent).toBe('Updated Note Content');
    }, 25000);

    // Test to check if all notes can be deleted by iterating through and double-clicking each one
    it('Delete All Notes Individually', async () => {
        console.log('Deleting all notes individually...');
        // Add multiple notes to ensure there are notes to delete
        await page.click('.add-note');
        await page.click('.add-note');
        await page.click('.add-note');
        await page.waitForSelector('.note'); // Wait for notes to be added

        // Iterate through all notes and double-click to delete each one
        let noteElements = await page.$$('.note');
        while (noteElements.length > 0) {
            for (let noteElement of noteElements) {
                await noteElement.click({ clickCount: 2 }); // Double-click to delete
            }
            noteElements = await page.$$('.note'); // Refresh the list of note elements
        }

        // Check that there are no notes left
        const noteCount = await page.$$eval('.note', (notes) => notes.length);
        expect(noteCount).toBe(0);
    }, 25000);

    // Test to check if all notes can be deleted using the Ctrl + Shift + D shortcut
    it('Delete All Notes', async () => {
        console.log('Deleting all notes...');
        await page.click('.add-note');
        await page.click('.add-note');
        await page.waitForSelector('.note'); // Wait for notes to be added
        await page.keyboard.down('Control');
        await page.keyboard.down('Shift');
        await page.keyboard.press('D');
        await page.keyboard.up('Shift');
        await page.keyboard.up('Control');
        const noteCount = await page.$$eval('.note', (notes) => notes.length);
        expect(noteCount).toBe(0);
    }, 25000);

    // Test to check if the button text changes on hover and reverts on mouse out
    it('UI Button Change', async () => {
        console.log('Checking UI button change...');
        await page.hover('.add-note');
        let buttonText = await page.evaluate(() => document.querySelector('.add-note').textContent);
        expect(buttonText).toBe('+');

        await page.mouse.move(0, 0); // Move mouse away
        buttonText = await page.evaluate(() => document.querySelector('.add-note').textContent);
        expect(buttonText).toBe('Add Note');
    }, 25000);
});
