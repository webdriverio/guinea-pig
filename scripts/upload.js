#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const readDir = require('recursive-readdir')
const { S3, CloudFront } = require('aws-sdk')

const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID
const BUCKET_NAME = 'guinea-pig.webdriver.io'
const ROOT_DIR = path.resolve(__dirname, '..')
const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const IGNORE_FILE_SUFFIX = ['*.rb', (file) => (
  file.includes('/node_modules/') ||
  file.includes('/.git/')
)]

/* eslint-disable no-console */
;(async () => {
    const s3 = new S3()
    const files = await readDir(ROOT_DIR, IGNORE_FILE_SUFFIX)

    console.log(`Uploading ${ROOT_DIR} to S3 bucket ${BUCKET_NAME}`)
    await Promise.all(files.filter((file) => typeof mime.lookup(file) === 'string').map((file) => new Promise((resolve, reject) => s3.upload({
        Bucket: BUCKET_NAME,
        Key: file.replace(ROOT_DIR + '/', ''),
        Body: fs.createReadStream(file),
        ContentType: mime.lookup(file),
        ACL: 'public-read'
    }, UPLOAD_OPTIONS, (err, res) => {
        if (err) {
            console.error(`Couldn't upload file ${file}: ${err.stack}`)
            return reject(err)
        }

        console.log(`${file} uploaded`)
        return resolve(res)
    }))))

    console.log(`Invalidate objects from distribution ${DISTRIBUTION_ID}`)
    const cloudfront = new CloudFront()
    const { Invalidation } = await new Promise((resolve, reject) => cloudfront.createInvalidation({
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            CallerReference: `${Date.now()}`,
            Paths: { Quantity: 1, Items: ['/*'] }
        }
    }, function(err, data) {
        if (err) return reject(err)
        return resolve(data)
    }))
    console.log(`Created new invalidation with ID ${Invalidation.Id}`)
})().then(
    () => console.log('Successfully updated guinea-pig.webdriver.io'),
    (err) => {
      console.error(`Error uploading to guinea-pig.webdriver.io: ${err.stack}`)
      process.exit(1)
    }
)
/* eslint-enable no-console */
