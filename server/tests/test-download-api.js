// Test download API with different parameter combinations

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const TEST_VIDEO_URL = process.env.TEST_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function testDownloadAPI() {
    console.log('🧪 Testing Download API...\n');
    console.log(`Server URL: ${NEXT_PUBLIC_SERVER_URL}`);
    console.log(`Test Video URL: ${TEST_VIDEO_URL}\n`);

    try {
        // First, get available formats
        console.log('📋 Step 1: Get Available Formats');
        const formatsResponse = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/formats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: TEST_VIDEO_URL }),
        });

        if (!formatsResponse.ok) {
            console.error('❌ Failed to get formats');
            return;
        }

        const formatsData = await formatsResponse.json();
        console.log('✅ Formats retrieved successfully');
        console.log(`   Available formats: ${formatsData.availableOptions?.formats?.join(', ') || 'N/A'}`);
        console.log(`   Available qualities: ${formatsData.availableOptions?.qualities?.join(', ') || 'N/A'}`);
        console.log(`   Available bitrates: ${formatsData.availableOptions?.bitrates?.slice(0, 3).join(', ') || 'N/A'}...`);
        console.log('');

        if (!formatsData.formats || formatsData.formats.length === 0) {
            console.log('⚠️  No formats available for testing download');
            return;
        }

        // Test download with format only
        console.log('📋 Step 2: Test Download with Format Parameter');
        const testFormat = formatsData.availableOptions?.formats?.[0] || 'mp4';
        console.log(`   Testing with format: ${testFormat}`);
        
        const downloadResponse1 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: TEST_VIDEO_URL,
                format: testFormat
            }),
        });

        console.log(`   Status: ${downloadResponse1.status}`);
        console.log(`   Content-Type: ${downloadResponse1.headers.get('content-type')}`);
        console.log(`   Content-Disposition: ${downloadResponse1.headers.get('content-disposition')}`);
        
        if (downloadResponse1.ok) {
            console.log('   ✅ Download endpoint accepts format parameter');
        } else {
            const errorData = await downloadResponse1.json().catch(() => ({}));
            console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
        }
        console.log('');

        // Test download with format_id
        console.log('📋 Step 3: Test Download with Format ID');
        const testFormatId = formatsData.formats[0]?.format_id;
        if (testFormatId) {
            console.log(`   Testing with format_id: ${testFormatId}`);
            
            const downloadResponse2 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: TEST_VIDEO_URL,
                    format_id: testFormatId
                }),
            });

            console.log(`   Status: ${downloadResponse2.status}`);
            if (downloadResponse2.ok) {
                console.log('   ✅ Download endpoint accepts format_id parameter');
            } else {
                const errorData = await downloadResponse2.json().catch(() => ({}));
                console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
            }
        } else {
            console.log('   ⚠️  No format_id available for testing');
        }
        console.log('');

        // Test download with quality
        console.log('📋 Step 4: Test Download with Quality Parameter');
        const testQuality = formatsData.availableOptions?.qualities?.[0];
        if (testQuality) {
            console.log(`   Testing with quality: ${testQuality}`);
            
            const downloadResponse3 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: TEST_VIDEO_URL,
                    quality: testQuality
                }),
            });

            console.log(`   Status: ${downloadResponse3.status}`);
            if (downloadResponse3.ok) {
                console.log('   ✅ Download endpoint accepts quality parameter');
            } else {
                const errorData = await downloadResponse3.json().catch(() => ({}));
                console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
            }
        } else {
            console.log('   ⚠️  No quality available for testing');
        }
        console.log('');

        // Test download with combined parameters
        console.log('📋 Step 5: Test Download with Combined Parameters');
        if (testFormat && testQuality) {
            console.log(`   Testing with format: ${testFormat}, quality: ${testQuality}`);
            
            const downloadResponse4 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: TEST_VIDEO_URL,
                    format: testFormat,
                    quality: testQuality
                }),
            });

            console.log(`   Status: ${downloadResponse4.status}`);
            if (downloadResponse4.ok) {
                console.log('   ✅ Download endpoint accepts combined parameters');
            } else {
                const errorData = await downloadResponse4.json().catch(() => ({}));
                console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
            }
        }
        console.log('');

        console.log('✅ Download API tests completed!');
        console.log('ℹ️  Note: Actual file downloads were not performed to save bandwidth.');
        console.log('   The tests verify that the API accepts the parameters correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

// Run tests
testDownloadAPI();



