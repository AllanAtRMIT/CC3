const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3')

let doc = new S3Client({ region: 'ap-southeast-2'})

doc.send(new CreateBucketCommand({ Bucket: 'imagess3855474' }))