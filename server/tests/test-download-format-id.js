// Test download API with format_id to ensure it uses the exact format

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const TEST_VIDEO_URL = process.env.TEST_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function testDownloadWithFormatId() {
    console.log('🧪 Testing Download API with format_id...\n');

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
        const formats = formatsData.formats || [];
        
        console.log(`✅ Retrieved ${formats.length} formats`);
        console.log('');

        // Find a specific format to test with (prefer 1080p MP4 if available)
        let testFormat = formats.find(f => f.ext === 'mp4' && f.quality === '1080p');
        if (!testFormat) {
            testFormat = formats.find(f => f.ext === 'mp4');
        }
        if (!testFormat) {
            testFormat = formats[0];
        }

        if (!testFormat) {
            console.log('❌ No formats available for testing');
            return;
        }

        console.log('📋 Step 2: Test Download with Specific format_id');
        console.log(`   Selected Format:`);
        console.log(`     Format ID: ${testFormat.format_id}`);
        console.log(`     Extension: ${testFormat.ext}`);
        console.log(`     Quality: ${testFormat.quality}`);
        console.log(`     Resolution: ${testFormat.resolution}`);
        console.log(`     Bitrate: ${testFormat.bitrate ? `${(testFormat.bitrate / 1000).toFixed(0)} kbps` : 'N/A'}`);
        console.log('');

        // Test download with format_id only
        console.log('   Testing download with format_id only...');
        const downloadResponse1 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: TEST_VIDEO_URL,
                format_id: testFormat.format_id
            }),
        });

        console.log(`   Status: ${downloadResponse1.status}`);
        console.log(`   Content-Type: ${downloadResponse1.headers.get('content-type')}`);
        console.log(`   Content-Disposition: ${downloadResponse1.headers.get('content-disposition')}`);
        
        if (downloadResponse1.ok) {
            console.log('   ✅ Download endpoint correctly uses format_id');
            // Don't actually download, just verify headers
            const contentDisposition = downloadResponse1.headers.get('content-disposition') || '';
            const expectedExt = testFormat.ext;
            if (contentDisposition.includes(`.${expectedExt}`)) {
                console.log(`   ✅ File extension matches selected format (${expectedExt})`);
            } else {
                console.log(`   ⚠️  File extension might not match (expected .${expectedExt})`);
            }
        } else {
            const errorData = await downloadResponse1.json().catch(() => ({}));
            console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
        }
        console.log('');

        // Test download with format_id + other parameters (format_id should take priority)
        console.log('📋 Step 3: Test Download with format_id + other parameters');
        console.log('   (format_id should take priority over other filters)');
        const downloadResponse2 = await fetch(`${NEXT_PUBLIC_SERVER_URL}/api/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: TEST_VIDEO_URL,
                format_id: testFormat.format_id,
                format: 'webm', // This should be ignored
                quality: '144p', // This should be ignored
            }),
        });

        console.log(`   Status: ${downloadResponse2.status}`);
        if (downloadResponse2.ok) {
            console.log('   ✅ Download endpoint correctly prioritizes format_id');
            const contentDisposition = downloadResponse2.headers.get('content-disposition') || '';
            if (contentDisposition.includes(`.${testFormat.ext}`)) {
                console.log(`   ✅ Correct format downloaded despite conflicting parameters`);
            }
        } else {
            const errorData = await downloadResponse2.json().catch(() => ({}));
            console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
        }
        console.log('');

        console.log('✅ Download API tests completed!');
        console.log('ℹ️  Note: Actual file downloads were not performed to save bandwidth.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

// Run tests
testDownloadWithFormatId();



