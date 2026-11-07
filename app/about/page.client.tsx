"use client";

import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import Testimonials from "../components/Testimonials";
import FooterLine from "../components/FooterLine";
import { openBooking } from "@/lib/booking";

export default function AboutClient() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="bg-black px-4 pt-24 pb-16 text-[#F2F2F2] sm:px-6 md:px-8"
      >
        <article className="mx-auto max-w-[640px]">
          <h1 className="grad font-display mb-10 text-center text-[36px] leading-tight tracking-[-0.015em] text-balance sm:text-[48px]">
            From small-town church drummer to world-class performer
          </h1>

          <figure className="mx-auto mb-12 flex max-w-[320px] flex-col items-center">
            <Image
              src="/portrait-about.jpg"
              alt="Anthony Dake — Columbus, OH"
              width={320}
              height={369}
              priority
              sizes="(max-width: 640px) 100vw, 320px"
              className="w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-3 text-center text-[12px] text-[#5C5C5C]">
              Columbus, OH
            </figcaption>
          </figure>

          <div className="space-y-6 text-[16px] leading-[1.75] text-[#9A9A9A]">
            <p>
              By 10 I was running click, following vocal cues, navigating IEMs, and managing
              show flow for Sunday morning worship services that pulled close to <strong className="font-normal text-[#F2F2F2]">a thousand
              people</strong> through the doors every weekend.
            </p>

            <p className="text-[#F2F2F2]">
              Drumming was something I was raised inside of.
            </p>

            <p>
              I grew up in Topeka, Kansas &mdash; the wrong zip code to be born into if you want a
              music career. The scene was small bordering on nonexistent. I started learning
              percussion at the age of 4, and after rotating through various teachers, God put
              Jordan Hymon (Bart Walker Band, Mike Farris) in my path. For years I learned
              everything I knew from him: <strong className="font-normal text-[#F2F2F2]">all groove, all pocket</strong>, with a couple cool fills along
              the way. Michael Jackson records and 90s and early 2000s gospel on blast in the
              speakers behind us as we played along.
            </p>

            <figure className="mx-auto my-4 flex max-w-[280px] flex-col items-center">
              <Image
                src="/anthony-dake-drums.jpg"
                alt="Anthony Dake as a child at his first drum kit in Topeka, Kansas"
                width={280}
                height={280}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 280px"
                className="w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-center text-[12px] text-[#5C5C5C]">
                First kit · Topeka, KS
              </figcaption>
            </figure>

            <p>
              We didn&apos;t talk a ton in lessons. It was all play, and I loved every second of it.
              He was the pocket king then and he still is in my book. Around the time I hit my
              teens he moved to Nashville.
            </p>

            <p>
              By 16 I&apos;d found marching band drumline and rivaled the biggest band nerd you
              thought you knew. I was dropped off early each morning to spend hours before school
              in the band room, just drumming. Soon my electives filled up with band, band, and
              more band.
            </p>

            <p>
              For people outside the marching arts: DCI and WGI are essentially the world
              championships for marching bands and percussion ensembles &mdash; hundreds of
              auditionees from across the country, sometimes the globe, for a handful of seats.
              It&apos;s a beautiful blend of extraordinary discipline, teamwork, and skill-building
              with the freedom of art and musical pageantry.
            </p>

            <p>
              I began auditioning at 14 and continued auditioning for years. Got cut. Practiced.
              Got cut. <strong className="font-normal text-[#F2F2F2]">Practiced harder.</strong> Found another paramount teacher in Joe Pfau (RCC 2015,
              BlueQ 2011&ndash;2013). And eventually started winning quad line seats &mdash; on technical
              skill, marching coordination, and personality. Dojo Percussion in 2016 under Dana
              Murray (Berklee, Wynton Marsalis). Shadow Drum &amp; Bugle Corps that same summer. Blue Knights in 2017, my first
              World Class corps, as <strong className="font-normal text-[#F2F2F2]">the youngest member of the corps</strong> at 17 years old.
            </p>

            <p>
              That felt like the right moment to make a real move and pursue music as a
              profession. Through Cameron Leach (Columbus Symphony Orchestra), I found{" "}
              <a
                href="https://www.jazzartsgroup.org/meet-the-cjo/bob-breithaupt/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F2F2F2] underline decoration-white/20 underline-offset-4 hover:decoration-white/50 transition-colors"
              >
                Bob Breithaupt
              </a>
              {" "}&mdash; longtime Columbus Jazz Orchestra drummer who has played with more jazz greats
              than I can fit in this paragraph. His students include Matt Billingslea (Taylor
              Swift), Brian Fullen (Shania Twain), and Stephan Fess (Jared Blake). I was hungry
              for a bigger room, harder competition, and a better teacher. Bob was all three. I
              was provided with a scholarship to <strong className="font-normal text-[#F2F2F2]">Capital University Conservatory of Music</strong>.
            </p>

            <p>
              I came back as section leader of the quad line for Blue Knights in 2018 and we had
              another paramount summer. While juggling school I made it into two more World Class
              championship-winning ensembles for the 2020 season: <strong className="font-normal text-[#F2F2F2]">Rhythm X</strong> and <strong className="font-normal text-[#F2F2F2]">the Bluecoats</strong>.
            </p>

            <figure className="mx-auto my-8 flex max-w-[480px] flex-col items-center">
              <Image
                src="/photos/about-blue-knights-2018.jpg"
                alt="Anthony Dake on tenor drums with the Blue Knights, DCI 2018"
                width={1600}
                height={1067}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 480px"
                className="w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-center text-[12px] text-[#5C5C5C]">
                Blue Knights · DCI 2018
              </figcaption>
            </figure>

            <p className="text-[#F2F2F2]">
              And right when I&apos;d hit the pinnacle of everything I&apos;d been chasing since I was 10 &mdash; the world fell apart.
            </p>

            <p>
              I&apos;d love to say I held it together through the pandemic. I didn&apos;t. The
              conservatory closed, I dropped out of my classes, drove back to Kansas, and worked
              the family farm as a 21-year-old musician with no work, no money, no degree, and to
              top it all off, a concussion that kept me off the kit and out of gigging. That one
              beat the hell out of me. I sat out a year and a half depressed, healing, dealing
              with chronic headaches, watching the musical world I&apos;d built feel like it was
              crumbling in real time.
            </p>

            <p>
              I think I generally undersell the severity of that injury. At a certain point, it
              stopped feeling like I was just &ldquo;recovering&rdquo; and started feeling like <strong className="font-normal text-[#F2F2F2]">I was
              disappearing</strong>. I realized if I didn&apos;t choose something, I was going to lose more
              than just music.
            </p>

            <p>
              In the thick of it, I promised my mom I&apos;d finish school. But really that was a
              promise I made to myself.
            </p>

            <p className="text-[#F2F2F2]">
              Summer of 2021 I picked it back up.
            </p>

            <p className="text-[#F2F2F2]">
              I have approached every day since as if it is day one.
            </p>

            <figure className="mx-auto my-8 flex max-w-[480px] flex-col items-center">
              <Image
                src="/photos/about-duality-2022.jpg"
                alt="Anthony Dake at the drum kit during D.U.A.L.I.T.Y., his senior recital at the Garden Theatre, 2022"
                width={1439}
                height={809}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 480px"
                className="w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-center text-[12px] text-[#5C5C5C]">
                D.U.A.L.I.T.Y. · senior recital, Garden Theatre · 2022
              </figcaption>
            </figure>

            <p>
              That mentality is where the work I&apos;m doing now actually comes from. I call myself
              an <strong className="font-normal text-[#F2F2F2]">Architect of Sound</strong> because rebuilding from zero forced me to understand how
              music is constructed. To pay attention beyond what I play, but how I think. The
              decisions underneath the decisions. The system underpinning the work. Success is a
              process, not a destination. <strong className="font-normal text-[#F2F2F2]">That&apos;s what I create and document. That&apos;s what I teach.</strong>
            </p>

            <p>
              An architect designs the structure, the flow, the load-bearing elements you
              don&apos;t see. That&apos;s how I approach music now. I&apos;m building frameworks that hold
              under pressure &mdash; live, in the moment, across genres, across rooms, across artists.
            </p>

            <p>
              My niche is the exact blend of my father, a technology teacher, and my mother, a
              music teacher. <strong className="font-normal text-[#F2F2F2]">Acoustic and electronic integration.</strong> Running tracks, triggering
              samples, blending kit and machine across every genre I can get my hands on.
            </p>

            <p>
              The receipts: main-stage festival sets at Columbus Pride and ComFest in 2024 and
              2025 with KJ The Cool Nerd and KeezyTheeUnkind. The musical theatre drum chair at
              Short North Stage for <em>Rock of Ages</em> in 2022. Performances at the Ginger
              Rabbit Jazz Lounge with Rob Dove, Brothers Drake with Waves De Ache, Rambling
              House with AR!YAH, Spacebar with Valerie Lighthart, and rooms across Columbus with
              WANYEH, J.SOL, and a roster of independent artists across the Great Lakes. Library
              Educational Tours with the Jazz Arts Group. And a featured drummer with Louis
              Pettinelli Entertainment for high-profile weddings and corporate events across the
              region.
            </p>

            <figure className="mx-auto my-8 flex max-w-[360px] flex-col items-center">
              <Image
                src="/photos/about-main-street-2022.jpg"
                alt="Anthony Dake drumming at the Main Street Music Festival with KJ The Cool Nerd, 2022"
                width={1200}
                height={1774}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 360px"
                className="w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-center text-[12px] text-[#5C5C5C]">
                Main Street Music Festival · with KJ The Cool Nerd · 2022
              </figcaption>
            </figure>

            <p className="text-[#F2F2F2]">
              The blueprint is bigger.
            </p>

            <p>
              Headlining stages I grew up studying and dreaming about &mdash; Coachella, Bonnaroo,
              Lollapalooza, Stagecoach, Rolling Loud, all of them.
            </p>

            <p className="mt-4 text-[13px] text-[#5C5C5C]">
              The future is something I&apos;m architecting and constructing, piece by piece. Come build it with me.
            </p>
          </div>
        </article>

        <Testimonials />

        <p className="mx-auto mt-16 flex max-w-[640px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] text-[#F2F2F2]">
          <button type="button" onClick={() => openBooking()} className="hover:text-[#9A9A9A] transition-colors">
            Book →
          </button>
          <span className="text-[#5C5C5C]" aria-hidden="true">·</span>
          <a href="mailto:adakemusic@gmail.com" className="hover:text-[#9A9A9A] transition-colors">
            Email →
          </a>
          <span className="text-[#5C5C5C]" aria-hidden="true">·</span>
          <Link href="/epk" className="hover:text-[#9A9A9A] transition-colors">
            Press kit →
          </Link>
          <span className="text-[#5C5C5C]" aria-hidden="true">·</span>
          <Link href="/practice" className="hover:text-[#9A9A9A] transition-colors">
            Practice journal →
          </Link>
        </p>
      </main>
      <FooterLine />
    </>
  );
}
