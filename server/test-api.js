// Using built-in fetch (Node.js 18+)

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const TEST_VIDEO_URL = process.env.TEST_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll as test video

async function testFormatsAPI() {
    console.log('🧪 Testing Formats API...\n');
    console.log(`Server URL: ${SERVER_URL}`);
    console.log(`Test Video URL: ${TEST_VIDEO_URL}\n`);

    try {
        // Test 1: Health check
        console.log('📋 Test 1: Health Check');
        const healthResponse = await fetch(`${SERVER_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);
        console.log('');

        // Test 2: Formats endpoint
        console.log('📋 Test 2: Get Available Formats');
        const formatsResponse = await fetch(`${SERVER_URL}/api/formats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: TEST_VIDEO_URL }),
        });

        if (!formatsResponse.ok) {
            const errorData = await formatsResponse.json();
            console.error('❌ Formats API Error:', errorData);
            return;
        }

        const formatsData = await formatsResponse.json();
        console.log('✅ Formats API Response:');
        console.log('Status:', formatsData.status);
        console.log('');

        if (formatsData.availableOptions) {
            console.log('📊 Available Options:');
            console.log('  Formats:', formatsData.availableOptions.formats);
            console.log('  Qualities:', formatsData.availableOptions.qualities);
            console.log('  Bitrates:', formatsData.availableOptions.bitrates);
            console.log('');
        }

        if (formatsData.formats && formatsData.formats.length > 0) {
            console.log(`📦 Total Formats Found: ${formatsData.formats.length}`);
            console.log('');
            console.log('📋 Sample Formats (first 5):');
            formatsData.formats.slice(0, 5).forEach((format, index) => {
                console.log(`  ${index + 1}. Format ID: ${format.format_id}`);
                console.log(`     Extension: ${format.ext}`);
                console.log(`     Quality: ${format.quality || 'N/A'}`);
                console.log(`     Resolution: ${format.resolution || 'N/A'}`);
                console.log(`     Bitrate: ${format.bitrate ? `${(format.bitrate / 1000).toFixed(0)} kbps` : 'N/A'}`);
                console.log(`     Has Audio: ${format.hasAudio}`);
                console.log(`     File Size: ${format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}`);
                console.log('');
            });
        }

        // Test 3: Verify filtering works
        console.log('📋 Test 3: Verify Filtering Logic');
        if (formatsData.availableOptions && formatsData.availableOptions.formats.length > 0) {
            const testFormat = formatsData.availableOptions.formats[0];
            const filteredByFormat = formatsData.formats.filter(f => f.ext === testFormat);
            console.log(`✅ Formats filtered by "${testFormat}": ${filteredByFormat.length} options`);
            
            if (formatsData.availableOptions.qualities.length > 0) {
                const testQuality = formatsData.availableOptions.qualities[0];
                const filteredByQuality = formatsData.formats.filter(f => f.quality === testQuality);
                console.log(`✅ Formats filtered by quality "${testQuality}": ${filteredByQuality.length} options`);
            }
            
            if (formatsData.availableOptions.bitrates.length > 0) {
                const testBitrate = formatsData.availableOptions.bitrates[0];
                // Extract numeric bitrate for comparison
                const testBitrateNum = testBitrate.includes('Mbps') 
                    ? parseFloat(testBitrate.replace(' Mbps', '')) * 1000000
                    : parseFloat(testBitrate.replace(' kbps', '')) * 1000;
                const filteredByBitrate = formatsData.formats.filter(f => {
                    if (!f.bitrate) return false;
                    const diff = Math.abs(f.bitrate - testBitrateNum);
                    return diff / testBitrateNum < 0.1; // 10% tolerance
                });
                console.log(`✅ Formats filtered by bitrate "${testBitrate}": ${filteredByBitrate.length} options`);
            }
        }

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
testFormatsAPI();

