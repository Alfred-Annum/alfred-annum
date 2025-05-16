

const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input span');
const chatbox = document.querySelector('.chatbox');
const chatbotToggler = document.querySelector('.chatbot-toggler');
const chatbotCloseBtn = document.querySelector('.close-btn');
// end of chatbot const

// portfolio function start

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            burger.classList.remove('active');
        });
    });

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        // Here you would typically send the email to your newsletter service
        alert(`Thank you for subscribing with ${email}! You'll receive updates soon.`);
        this.reset();
    });
}

// Back to top button animation
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Smooth scroll to top
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize footer year
document.getElementById('year').textContent = new Date().getFullYear();


    // Theme Switch
    const themeSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeSwitch.checked = true;
        }
    }

    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animate Progress Bars on Scroll
    const animateOnScroll = () => {
        const skillsSection = document.getElementById('skills');
        const progressBars = document.querySelectorAll('.progress');

        if (isInViewport(skillsSection)) {
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            window.removeEventListener('scroll', animateOnScroll);
        }
    };

    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    };

    window.addEventListener('scroll', animateOnScroll);

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Form submission
      emailjs.init({
       publicKey: 'N1-e3MDsBFPUvdn2H',
       });

        const msg = document.querySelector(".form-message");

        const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.querySelector(".load").classList.add("show-list");

             emailjs.sendForm('service_aqbc3rk', 'template_o1zy7fg', this).then(
                 function(){
                  const contactForm = document.querySelector('.contact-form').reset();
                   document.querySelector(".load").classList.remove("show-list");
                    msg.innerHTML ="";
                    msg.innerHTML += "<span class='success-msg'>Email Sent</span>";
                     msg.classList.add("show-list");
                     setTimeout(()=> msg.classList.remove("show-list"), 5000);
             },
            //  function(error){
            //      document.querySelector(".load").classList.toggle("show-list");
            //      msg.classList.add("show-list");
            //       msg.innerHTML += "<span class='error-msg'>Email Not Sent</span>";
            //  }
             );
        });
    }
});

// portfolio function end

let userMessage;
const API_KEY= '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';
const inputInitHeight=chatInput.scrollHeight;

const createChatLi=(message, className)=>{
    // A chat <li> element with pass message and class name
    const chatLi=document.createElement('li');
    chatLi.classList.add('chat', className);
    let chatContent = className ==='outgoing' ? `<p></p>` : ` <span class="matrial-symbols"><i class='bx bxs-bot'></i></span> <p></p>`;
    chatLi.innerHTML=chatContent;
    chatLi.querySelector('p').textContent=message;
    return chatLi;
}

const generateResponse=(incomingChatLi)=>{
    const API_URL='https://openrouter.ai/api/v1/chat/completions';
    const messageElement=incomingChatLi.querySelector('p');

    const requestOptions={
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout:free",
        messages: [{"role": "user","content": userMessage}]
        })
    }

    // send POST request to API, get response
    fetch(API_URL, requestOptions).then(res => res.json()).then(data =>{
        messageElement.textContent=data.choices[0].message.content;
        // console.log(data);
    }).catch((error)=>{
        messageElement.classList.add('error');
        messageElement.textContent='Oops! something went wrong. Please try again.';
        // console.log(error);
    }).finally(()=> chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat=()=>{
    userMessage=chatInput.value.trim();
    if(!userMessage) return;
    chatInput.value='';
    chatInput.style.height= `${inputInitHeight}px`;

    // append the users message
   chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
   chatbox.scrollTo(0, chatbox.scrollHeight);


      setTimeout(()=>{
    // display "thinking..." while waiting for the response
    const incomingChatLi=createChatLi('Thinking...', 'incoming')
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
   }, 500);
}

chatInput.addEventListener('input', ()=>{
    // adjust the height of the input textarea
   chatInput.style.height= `${inputInitHeight}px`;
   chatInput.style.height= `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener('keydown', (e)=>{
    // if enter key is press without shift key and the window 
    // width is greater than 800px, handle the chat
   if(e.key === 'Enter' && window.innerWidth > 800){
     e.preventDefault();
     handleChat();
   }
});

sendChatBtn.addEventListener('click', handleChat);
chatbotCloseBtn.addEventListener('click', ()=> document.body.classList.remove('show-chatbot'));
chatbotToggler.addEventListener('click', ()=> document.body.classList.toggle('show-chatbot'));


// Enhanced Page Loader with Jump & Slide Effects
document.addEventListener('DOMContentLoaded', function() {
  const pageLoader = document.querySelector('.page-loader');
  
//   For demo purposes - replace with actual load event
  const simulateLoadTime = Math.random() * 2000 + 1500; // 1.5-3.5s
  
  setTimeout(function() {
    pageLoader.classList.add('fade-out');
    
//     // Remove loader after animation completes
    setTimeout(function() {
      pageLoader.remove();
    }, 1000);
  }, simulateLoadTime);
  
//   // For real implementation, use:
//   window.addEventListener('load', function() {
//     pageLoader.classList.add('fade-out');
//     setTimeout(() => pageLoader.remove(), 3000);
//   }, simulateLoadTime);
});

// Auto-changing hero images
function initImageRotation() {
    const images = document.querySelectorAll('.image-wrapper .profile-img');
    let currentIndex = 0;
    
    if (images.length === 0) return;
    
    // Show first image immediately
    images[currentIndex].classList.add('active');
    
    // Rotate images every 4 seconds
    setInterval(() => {
        // Fade out current image
        images[currentIndex].classList.remove('active');
        
        // Move to next image (loop back to 0 if at end)
        currentIndex = (currentIndex + 1) % images.length;
        
        // Fade in next image
        images[currentIndex].classList.add('active');
        
        // Optional: Add a slight zoom effect
        setTimeout(() => {
            images[currentIndex].style.transform = 'scale(1.03)';
            setTimeout(() => {
                images[currentIndex].style.transform = 'scale(1)';
            }, 500);
        }, 100);
    }, 4000); // Change image every 4 seconds
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initImageRotation();
    
    // Your other existing code...
});

// weather for cast