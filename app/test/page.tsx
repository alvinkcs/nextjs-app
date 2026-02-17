import styles from "../page.module.css"
import Link from 'next/link'

export default async function Page() {

    return (
      <main className={styles.resumeMain}>
        <nav className={styles.nav}>
          <Link href="/blog">blog</Link>
          <Link href="/money">money</Link>
          <Link href="/trade">Trade</Link>
        </nav>

        {/* <TripCalculator /> */}

        {/* limit accepted file types = accept="image/*" */}
        {/* accpet=".pdf, .doc, .xlsx" */}
        {/* capture="camera" */}
        {/* <form method="post" encType="multipart/form-data" action="https://imagekit.io/does-not-exists"> */}
          {/* <input type="file" name="file" /> */}
          {/* <button>Upload</button> */}
        {/* </form> */}

        <iframe id="inlineFrameExample" title="Inline Frame Example" width="300" height="200" src="https://www.openstreetmap.org/export/embed.html?bbox=114.21554088592531%2C22.27827535417046%2C114.22669887542726%2C22.28565163858647&amp;layer=mapnik"></iframe>
      </main>
    )
}