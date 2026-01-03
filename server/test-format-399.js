// Test downloading format 399 (1080p, 378 kbps) specifically

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const TEST_VIDEO_URL = process.env.TEST_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function testFormat399() {
    console.log('🧪 Testing Format 399 (1080p, 378 kbps) Download...\n');

    try {
        // First, get formats to verify format 399 exists
        console.log('📋 Step 1: Verify Format 399 exists');
        const formatsResponse = await fetch(`${SERVER_URL}/api/formats`, {
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
        
        const format399 = formats.find(f => f.format_id === '399');
        if (format399) {
            console.log('✅ Format 399 found:');
            console.log(`   Extension: ${format399.ext}`);
            console.log(`   Quality: ${format399.quality}`);
            console.log(`   Resolution: ${format399.resolution}`);
            console.log(`   Bitrate: ${format399.bitrate} bps (${(format399.bitrate / 1000).toFixed(0)} kbps)`);
            console.log(`   Has Audio: ${format399.hasAudio}`);
            console.log('');
        } else {
            console.log('⚠️  Format 399 not found in available formats');
            console.log('   Available format IDs:', formats.slice(0, 10).map(f => f.format_id).join(', '));
            return;
        }

        // Test download with format_id 399
        console.log('📋 Step 2: Test Download with format_id=399');
        const downloadResponse = await fetch(`${SERVER_URL}/api/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: TEST_VIDEO_URL,
                format_id: '399'
            }),
        });

        console.log(`   Status: ${downloadResponse.status}`);
        console.log(`   Content-Type: ${downloadResponse.headers.get('content-type')}`);
        console.log(`   Content-Disposition: ${downloadResponse.headers.get('content-disposition')}`);
        
        if (downloadResponse.ok) {
            console.log('   ✅ Download request accepted');
            console.log('   ℹ️  Note: Actual download not performed to save bandwidth');
        } else {
            const errorData = await downloadResponse.json().catch(() => ({}));
            console.log(`   ❌ Download failed:`);
            console.log(`   ${JSON.stringify(errorData, null, 2)}`);
        }
        console.log('');

        // Compare with format 18
        console.log('📋 Step 3: Compare with Format 18 (360p)');
        const format18 = formats.find(f => f.format_id === '18');
        if (format18) {
            console.log('   Format 18:');
            console.log(`     Extension: ${format18.ext}`);
            console.log(`     Quality: ${format18.quality}`);
            console.log(`     Resolution: ${format18.resolution}`);
            console.log(`     Bitrate: ${format18.bitrate} bps (${(format18.bitrate / 1000).toFixed(0)} kbps)`);
            console.log(`     Has Audio: ${format18.hasAudio}`);
            console.log('');
            console.log('   Key Difference:');
            console.log(`     Format 399: Video-only (no audio)`);
            console.log(`     Format 18: Has audio`);
            console.log('   ⚠️  If format 399 fails, it might be because it requires audio merging');
        }

        console.log('\n✅ Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

testFormat399();



