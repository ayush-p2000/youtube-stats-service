// Test with the exact data structure the user provided

const testFormats = [
    {
        "format_id": "160",
        "ext": "mp4",
        "resolution": "144p",
        "quality": "144p",
        "bitrate": 11221,
        "fps": 24,
        "note": "144p",
        "filesize": 261189,
        "hasAudio": false
    },
    {
        "format_id": "278",
        "ext": "webm",
        "resolution": "144p",
        "quality": "144p",
        "bitrate": 24640,
        "fps": 24,
        "note": "144p",
        "filesize": 573531,
        "hasAudio": false
    },
    {
        "format_id": "394",
        "ext": "mp4",
        "resolution": "144p",
        "quality": "144p",
        "bitrate": 23013,
        "fps": 24,
        "note": "144p",
        "filesize": 535663,
        "hasAudio": false
    },
    {
        "format_id": "133",
        "ext": "mp4",
        "resolution": "240p",
        "quality": "240p",
        "bitrate": 16526,
        "fps": 24,
        "note": "240p",
        "filesize": 384680,
        "hasAudio": false
    },
    {
        "format_id": "242",
        "ext": "webm",
        "resolution": "240p",
        "quality": "240p",
        "bitrate": 40952,
        "fps": 24,
        "note": "240p",
        "filesize": 953209,
        "hasAudio": false
    },
    {
        "format_id": "395",
        "ext": "mp4",
        "resolution": "240p",
        "quality": "240p",
        "bitrate": 37563,
        "fps": 24,
        "note": "240p",
        "filesize": 874337,
        "hasAudio": false
    },
    {
        "format_id": "134",
        "ext": "mp4",
        "resolution": "360p",
        "quality": "360p",
        "bitrate": 26757,
        "fps": 24,
        "note": "360p",
        "filesize": 622803,
        "hasAudio": false
    },
    {
        "format_id": "18",
        "ext": "mp4",
        "resolution": "360p",
        "quality": "360p",
        "bitrate": 155759,
        "fps": 24,
        "note": "360p",
        "filesize": 3626653,
        "hasAudio": true
    },
    {
        "format_id": "243",
        "ext": "webm",
        "resolution": "360p",
        "quality": "360p",
        "bitrate": 76959,
        "fps": 24,
        "note": "360p",
        "filesize": 1791319,
        "hasAudio": false
    },
    {
        "format_id": "396",
        "ext": "mp4",
        "resolution": "360p",
        "quality": "360p",
        "bitrate": 68052,
        "fps": 24,
        "note": "360p",
        "filesize": 1583986,
        "hasAudio": false
    },
    {
        "format_id": "135",
        "ext": "mp4",
        "resolution": "480p",
        "quality": "480p",
        "bitrate": 39207,
        "fps": 24,
        "note": "480p",
        "filesize": 912584,
        "hasAudio": false
    },
    {
        "format_id": "244",
        "ext": "webm",
        "resolution": "480p",
        "quality": "480p",
        "bitrate": 116534,
        "fps": 24,
        "note": "480p",
        "filesize": 2712446,
        "hasAudio": false
    },
    {
        "format_id": "397",
        "ext": "mp4",
        "resolution": "480p",
        "quality": "480p",
        "bitrate": 114073,
        "fps": 24,
        "note": "480p",
        "filesize": 2655169,
        "hasAudio": false
    },
    {
        "format_id": "136",
        "ext": "mp4",
        "resolution": "720p",
        "quality": "720p",
        "bitrate": 66347,
        "fps": 24,
        "note": "720p",
        "filesize": 1544315,
        "hasAudio": false
    },
    {
        "format_id": "247",
        "ext": "webm",
        "resolution": "720p",
        "quality": "720p",
        "bitrate": 187679,
        "fps": 24,
        "note": "720p",
        "filesize": 4368434,
        "hasAudio": false
    },
    {
        "format_id": "398",
        "ext": "mp4",
        "resolution": "720p",
        "quality": "720p",
        "bitrate": 210760,
        "fps": 24,
        "note": "720p",
        "filesize": 4905672,
        "hasAudio": false
    },
    {
        "format_id": "137",
        "ext": "mp4",
        "resolution": "1080p",
        "quality": "1080p",
        "bitrate": 173363,
        "fps": 24,
        "note": "1080p",
        "filesize": 4035199,
        "hasAudio": false
    },
    {
        "format_id": "248",
        "ext": "webm",
        "resolution": "1080p",
        "quality": "1080p",
        "bitrate": 347660,
        "fps": 24,
        "note": "1080p",
        "filesize": 8092153,
        "hasAudio": false
    },
    {
        "format_id": "399",
        "ext": "mp4",
        "resolution": "1080p",
        "quality": "1080p",
        "bitrate": 377524,
        "fps": 24,
        "note": "1080p",
        "filesize": 8787251,
        "hasAudio": false
    }
];

// Simulate the frontend filtering logic
const formatBitrate = (bitrate) => {
  if (!bitrate) return undefined;
  if (bitrate >= 1000000) return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  if (bitrate >= 1000) return `${(bitrate / 1000).toFixed(0)} kbps`;
  return `${bitrate} bps`;
};

const parseBitrate = (bitrateStr) => {
  if (!bitrateStr) return null;
  if (bitrateStr.includes('Mbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' Mbps', '')) * 1000000);
  }
  if (bitrateStr.includes('kbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' kbps', '')) * 1000);
  }
  if (bitrateStr.includes('bps')) {
    return parseInt(bitrateStr.replace(' bps', ''));
  }
  return null;
};

const bitrateMatches = (bitrate, targetBitrateStr) => {
  if (!bitrate || !targetBitrateStr) return false;
  
  // Format the actual bitrate to see what it would display as
  const formattedBitrate = formatBitrate(bitrate);
  if (formattedBitrate === targetBitrateStr) {
    return true; // Exact match after formatting
  }
  
  // Also check with tolerance for rounding differences
  const targetBitrate = parseBitrate(targetBitrateStr);
  if (targetBitrate === null) return false;
  
  // Allow 5% tolerance or at least 2kbps for rounding differences
  const tolerance = Math.max(2000, targetBitrate * 0.05);
  return Math.abs(bitrate - targetBitrate) <= tolerance;
};

function testUserScenario() {
    console.log('🧪 Testing with User\'s Exact Data Structure...\n');
    console.log('Scenario: Format=MP4, Quality=1080p, Bitrate=378 kbps\n');

    const selectedFormat = 'mp4';
    const selectedQuality = '1080p';
    const selectedBitrate = '378 kbps';

    console.log('📋 Step 1: Filter by Format (MP4)');
    let filtered = testFormats.filter(f => f.ext === selectedFormat);
    console.log(`   Found ${filtered.length} formats with ext="${selectedFormat}"`);
    console.log(`   Format IDs: ${filtered.map(f => f.format_id).join(', ')}`);
    console.log('');

    console.log('📋 Step 2: Filter by Quality (1080p)');
    filtered = filtered.filter(f => f.quality === selectedQuality);
    console.log(`   Found ${filtered.length} formats with quality="${selectedQuality}"`);
    console.log(`   Format IDs: ${filtered.map(f => f.format_id).join(', ')}`);
    filtered.forEach(f => {
        console.log(`     - Format ID ${f.format_id}: bitrate=${f.bitrate} bps (${formatBitrate(f.bitrate)})`);
    });
    console.log('');

    console.log('📋 Step 3: Filter by Bitrate (378 kbps)');
    console.log('   Testing bitrate matching:');
    filtered.forEach(f => {
        const formatted = formatBitrate(f.bitrate);
        const matches = bitrateMatches(f.bitrate, selectedBitrate);
        console.log(`     - Format ID ${f.format_id}: ${formatted} ${matches ? '✅ MATCHES' : '❌ does not match'}`);
    });
    
    filtered = filtered.filter(f => bitrateMatches(f.bitrate, selectedBitrate));
    console.log(`\n   Found ${filtered.length} formats matching bitrate="${selectedBitrate}"`);
    
    if (filtered.length > 0) {
        console.log('\n   ✅ Selected Format:');
        filtered.forEach(f => {
            console.log(`     Format ID: ${f.format_id}`);
            console.log(`     Extension: ${f.ext}`);
            console.log(`     Quality: ${f.quality}`);
            console.log(`     Resolution: ${f.resolution}`);
            console.log(`     Bitrate: ${formatBitrate(f.bitrate)} (${f.bitrate} bps)`);
            console.log(`     Has Audio: ${f.hasAudio}`);
        });
    } else {
        console.log('   ❌ No formats match all three criteria!');
    }
    console.log('');

    // Test what happens if we select format 18 (360p) by mistake
    console.log('📋 Step 4: Verify Format 18 (360p) should NOT be selected');
    const format18 = testFormats.find(f => f.format_id === '18');
    if (format18) {
        const matchesFormat = format18.ext === selectedFormat;
        const matchesQuality = format18.quality === selectedQuality;
        const matchesBitrate = bitrateMatches(format18.bitrate, selectedBitrate);
        console.log(`   Format 18: ext=${format18.ext} (${matchesFormat ? '✅' : '❌'}), quality=${format18.quality} (${matchesQuality ? '✅' : '❌'}), bitrate=${formatBitrate(format18.bitrate)} (${matchesBitrate ? '✅' : '❌'})`);
        if (!matchesFormat || !matchesQuality || !matchesBitrate) {
            console.log('   ✅ Format 18 correctly excluded (does not match all criteria)');
        }
    }
    console.log('');

    console.log('✅ Test completed!');
}

testUserScenario();



