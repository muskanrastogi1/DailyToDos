export interface MotivationalStory {
  id: string
  title: string
  person: string
  story: string
  lesson: string
  quote: string
}

export const motivationalStories: MotivationalStory[] = [
  {
    id: "oprah-fired",
    title: "Fired Before Fame",
    person: "Oprah Winfrey",
    story: "Oprah was publicly fired from her first TV job as an anchor in Baltimore. Her boss told her she was 'unfit for television.' Instead of giving up, she took a lower position as a talk show host. That 'demotion' led her to discover her true calling - connecting with people through conversation. She went on to build a media empire worth billions.",
    lesson: "Sometimes rejection redirects you to where you truly belong.",
    quote: "Turn your wounds into wisdom."
  },
  {
    id: "jk-rowling-rejection",
    title: "12 Rejections to Magic",
    person: "J.K. Rowling",
    story: "Before Harry Potter became a global phenomenon, J.K. Rowling was a single mother on welfare, battling depression. She wrote in cafes while her baby slept. Her manuscript was rejected by 12 publishers. One editor told her 'children's books don't make money.' The 13th publisher's daughter loved the first chapter, and the rest is history - a $25 billion franchise.",
    lesson: "Your circumstances don't define your destiny. Keep creating.",
    quote: "Rock bottom became the solid foundation on which I rebuilt my life."
  },
  {
    id: "steve-jobs-fired",
    title: "Fired From His Own Company",
    person: "Steve Jobs",
    story: "At 30, Steve Jobs was fired from Apple - the company he founded in his garage. It was devastating and public. But during his 11 years away, he started Pixar and NeXT. When Apple was failing, they bought NeXT and brought Steve back. He then created the iPod, iPhone, and iPad, transforming not just Apple but the entire world.",
    lesson: "Getting knocked down can be the start of your greatest comeback.",
    quote: "I didn't see it then, but getting fired was the best thing that could have happened to me."
  },
  {
    id: "beyonce-girls-tyme",
    title: "Losing on National TV",
    person: "Beyonce",
    story: "Before she was Queen Bey, young Beyonce and her group Girl's Tyme competed on Star Search and lost on national television. The judges dismissed them. Instead of quitting, she practiced harder. Her father quit his job to manage them. Years of grinding in small venues led to Destiny's Child and eventually her solo career as one of the greatest performers ever.",
    lesson: "Public failure is just practice for your private greatness.",
    quote: "I don't like to gamble, but if there's one thing I'm willing to bet on, it's myself."
  },
  {
    id: "walt-disney-bankrupt",
    title: "Bankrupt Dreamer",
    person: "Walt Disney",
    story: "Walt Disney's first animation company went bankrupt. He was told he 'lacked imagination and had no good ideas.' He was fired from a newspaper for not being creative enough. After many failures, he created Mickey Mouse. Even then, over 300 bankers rejected his vision for Disneyland. He mortgaged everything he owned to build it.",
    lesson: "The people who say it can't be done are often proven wrong by those doing it.",
    quote: "All our dreams can come true, if we have the courage to pursue them."
  },
  {
    id: "michael-jordan-cut",
    title: "Cut From The Team",
    person: "Michael Jordan",
    story: "Michael Jordan was cut from his high school varsity basketball team as a sophomore. He went home, locked himself in his room, and cried. But instead of quitting, he used the rejection as fuel. He practiced obsessively, eventually becoming the greatest basketball player of all time with 6 NBA championships.",
    lesson: "Use rejection as motivation, not as a verdict.",
    quote: "I've failed over and over and over again in my life. And that is why I succeed."
  },
  {
    id: "lady-gaga-dropped",
    title: "Dropped After 3 Months",
    person: "Lady Gaga",
    story: "Lady Gaga was signed to Def Jam Records at 19 - her dream come true. Three months later, they dropped her. She was devastated but kept performing at small clubs, perfecting her craft and unique style. She was eventually signed again and became one of the biggest pop stars ever, winning 13 Grammys and an Oscar.",
    lesson: "Being dropped doesn't mean you're not good enough - it means they weren't ready for you.",
    quote: "Do not allow people to dim your shine because they are blinded."
  },
  {
    id: "colonel-sanders-1009",
    title: "Success at 65",
    person: "Colonel Sanders",
    story: "Harland Sanders was 65, broke, and living off $105 social security checks when he started KFC. He drove across America pitching his chicken recipe. He was rejected 1,009 times before getting his first 'yes.' By his 70s, he had franchises everywhere. He proved age and rejection are just numbers.",
    lesson: "It's never too late, and no amount of rejection is final.",
    quote: "I made a resolve then that I was going to amount to something if I could."
  },
  {
    id: "vincent-van-gogh",
    title: "The Unseen Genius",
    person: "Vincent van Gogh",
    story: "Van Gogh sold only ONE painting during his lifetime and was considered a failure. He battled mental illness, poverty, and obscurity. Yet he painted almost 900 works driven purely by passion. Today, his paintings sell for over $100 million each. He never saw his success, but he never stopped creating.",
    lesson: "Create for the love of creation, not for immediate validation.",
    quote: "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced."
  },
  {
    id: "dwayne-johnson-7-bucks",
    title: "Seven Bucks in His Pocket",
    person: "Dwayne 'The Rock' Johnson",
    story: "After being cut from the Canadian Football League, Dwayne Johnson fell into depression. He had $7 in his pocket and had to move back with his parents. He started wrestling in small venues for $40 a night. His charisma eventually made him a WWE star, and then Hollywood's highest-paid actor. That $7 moment drives him every day.",
    lesson: "Your lowest moment can become the foundation of your greatest story.",
    quote: "Success isn't always about greatness. It's about consistency."
  },
  {
    id: "eminem-struggle",
    title: "The Trailer Park MC",
    person: "Eminem",
    story: "Marshall Mathers grew up in poverty, was bullied relentlessly, failed 9th grade three times, and was once so broke he couldn't afford bus fare to rap battles. His first album flopped completely. He considered ending it all. Then Dr. Dre discovered him, and he became one of the best-selling music artists ever.",
    lesson: "Your past and circumstances don't write your future - your persistence does.",
    quote: "You can make something of your life. It just depends on your drive."
  },
  {
    id: "malala-shot",
    title: "Shot But Not Silenced",
    person: "Malala Yousafzai",
    story: "At 15, Malala was shot in the head by the Taliban for advocating girls' education. She survived, and instead of hiding, she spoke louder. She became the youngest Nobel Prize laureate at 17 and continues fighting for education worldwide. They tried to silence her voice; she amplified it to millions.",
    lesson: "The greatest opposition often comes before the greatest impact.",
    quote: "One child, one teacher, one book, one pen can change the world."
  }
]

export interface HypeSong {
  id: string
  title: string
  artist: string
  spotifyUrl: string
  vibe: string
}

export const hypeSongs: HypeSong[] = [
  {
    id: "lose-yourself",
    title: "Lose Yourself",
    artist: "Eminem",
    spotifyUrl: "https://open.spotify.com/track/5Z01UMMf7V1o0MzF86s6WJ",
    vibe: "The ultimate motivation anthem"
  },
  {
    id: "stronger",
    title: "Stronger",
    artist: "Kanye West",
    spotifyUrl: "https://open.spotify.com/track/4fzsfWzRhPawzqhX8Qt9F3",
    vibe: "What doesn't kill you makes you stronger"
  },
  {
    id: "eye-of-tiger",
    title: "Eye of the Tiger",
    artist: "Survivor",
    spotifyUrl: "https://open.spotify.com/track/2HHtWyy5CgaQbC7XSoOb0e",
    vibe: "Classic underdog energy"
  },
  {
    id: "run-this-town",
    title: "Run This Town",
    artist: "JAY-Z ft. Rihanna & Kanye",
    spotifyUrl: "https://open.spotify.com/track/2igMKN1gOcyA2HFX2gY7d7",
    vibe: "Take over the world energy"
  },
  {
    id: "power",
    title: "POWER",
    artist: "Kanye West",
    spotifyUrl: "https://open.spotify.com/track/2gZUPNdnz5Y45eiGxpHGSc",
    vibe: "Feel unstoppable"
  },
  {
    id: "till-i-collapse",
    title: "Till I Collapse",
    artist: "Eminem ft. Nate Dogg",
    spotifyUrl: "https://open.spotify.com/track/4xkOaSrkexMciUUogZKVTS",
    vibe: "Never give up anthem"
  },
  {
    id: "cant-hold-us",
    title: "Can't Hold Us",
    artist: "Macklemore & Ryan Lewis",
    spotifyUrl: "https://open.spotify.com/track/3bidbhpOYeV4knp8AIu8Xn",
    vibe: "Celebration of hustle"
  },
  {
    id: "humble",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    spotifyUrl: "https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS",
    vibe: "Stay humble, work hard"
  },
  {
    id: "sicko-mode",
    title: "SICKO MODE",
    artist: "Travis Scott ft. Drake",
    spotifyUrl: "https://open.spotify.com/track/2xLMifQCjDGFmkHkpNLD9h",
    vibe: "Go crazy energy"
  },
  {
    id: "started-bottom",
    title: "Started From The Bottom",
    artist: "Drake",
    spotifyUrl: "https://open.spotify.com/track/3T4tUhGYeRNVUGevb0wThu",
    vibe: "Celebrate your journey"
  },
  {
    id: "all-i-do-win",
    title: "All I Do Is Win",
    artist: "DJ Khaled ft. T-Pain",
    spotifyUrl: "https://open.spotify.com/track/3Ylmm0dHvIJPdAFDWDN9bi",
    vibe: "Winner mentality"
  },
  {
    id: "dont-stop-believing",
    title: "Don't Stop Believin'",
    artist: "Journey",
    spotifyUrl: "https://open.spotify.com/track/4bHsxqR3GMrXTxEPLuK5ue",
    vibe: "Classic hope anthem"
  },
  {
    id: "work-harder",
    title: "Work",
    artist: "Rihanna ft. Drake",
    spotifyUrl: "https://open.spotify.com/track/4wJjSK0TX8rAP06sIoBJWD",
    vibe: "Put in the hours"
  },
  {
    id: "we-are-champions",
    title: "We Are the Champions",
    artist: "Queen",
    spotifyUrl: "https://open.spotify.com/track/7ccI9cStQbQdystvc6TvxD",
    vibe: "Victory anthem"
  },
  {
    id: "believer",
    title: "Believer",
    artist: "Imagine Dragons",
    spotifyUrl: "https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP",
    vibe: "Pain makes you stronger"
  },
  {
    id: "hall-fame",
    title: "Hall of Fame",
    artist: "The Script ft. will.i.am",
    spotifyUrl: "https://open.spotify.com/track/2Zlx64FHC1vlGdTKj6Mnlv",
    vibe: "You can be legendary"
  },
  {
    id: "roar",
    title: "Roar",
    artist: "Katy Perry",
    spotifyUrl: "https://open.spotify.com/track/6F5c58TMEs1byxUstkzVeM",
    vibe: "Find your voice"
  },
  {
    id: "fight-song",
    title: "Fight Song",
    artist: "Rachel Platten",
    spotifyUrl: "https://open.spotify.com/track/4lEqOjBd3oN0g3TBU7nEWV",
    vibe: "Small but mighty"
  }
]

export const quickBoosts: string[] = [
  "You've survived 100% of your worst days so far. You're undefeated.",
  "The fact that you're looking for motivation means you haven't given up. That's strength.",
  "Small progress is still progress. One task at a time.",
  "You don't have to be perfect today. You just have to try.",
  "Every expert was once a beginner. Every master was once a disaster.",
  "This feeling is temporary. Your potential is permanent.",
  "You are not behind. You are exactly where you need to be.",
  "The struggle you're in today is developing the strength you need for tomorrow.",
  "It's okay to have a slow day. Not every day needs to be productive.",
  "You're doing better than you think. Take a breath.",
  "Rest if you must, but don't quit.",
  "Your only competition is who you were yesterday.",
  "Difficult roads often lead to beautiful destinations.",
  "You are capable of amazing things. Start with one small step.",
  "The best time to start was yesterday. The second best time is now."
]
