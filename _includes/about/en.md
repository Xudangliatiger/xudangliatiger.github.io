
<style>
  /*body {*/
  /*  background-color: #ffffff;*/
  /*  font-family: -apple-system, Helvetica Neue, sans-serif;*/
  /*  color: #1d1d1f;*/
  /*  line-height: 1.6;*/
  /*}*/
  
  .section-title {
    font-size: 1.5em;
    font-weight: 600;
    color: #0071e3;
    border-bottom: 1px solid #d2d2d7;
    padding-bottom: 8px;
    margin: 40px 0 20px;
  }
  
  .paper-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 30px rgba(0, 113, 227, 0.1), /* 默认蓝色光晕 */
                0 0 20px rgba(191, 90, 242, 0.05), /* 紫色微光 */
                0 4px 10px rgba(0, 0, 0, 0.05); /* 底端阴影 */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    margin-bottom: 30px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .paper-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 113, 227, 0.15), /* 增强蓝色悬停光晕 */
                0 0 25px rgba(191, 90, 242, 0.1),
                0 6px 15px rgba(0, 0, 0, 0.1);
  }
  
  .purple-card {
    box-shadow: 0 8px 30px rgba(107, 35, 142, 0.15), /* 更浓郁的紫色光晕 */
                0 0 20px rgba(128, 0, 128, 0.1), /* 深紫微光 */
                0 4px 10px rgba(0, 0, 0, 0.05);
  }
  
  .purple-card:hover {
    box-shadow: 0 12px 40px rgba(107, 35, 142, 0.2), /* 增强紫色悬停光晕 */
                0 0 25px rgba(128, 0, 128, 0.15),
                0 6px 15px rgba(0, 0, 0, 0.1);
  }
  
  .gold-card {
    box-shadow: 0 8px 30px rgba(184, 134, 11, 0.2), /* 更浓郁的金色光晕 */
                0 0 20px rgba(218, 165, 32, 0.15), /* 亮金微光 */
                0 4px 10px rgba(0, 0, 0, 0.05);
  }
  
  .gold-card:hover {
    box-shadow: 0 12px 40px rgba(184, 134, 11, 0.25), /* 增强金色悬停光晕 */
                0 0 25px rgba(218, 165, 32, 0.2),
                0 6px 15px rgba(0, 0, 0, 0.1);
  }
  .paper-card .card-image {
    flex: 0 0 150px;
    width: 300px;
    /*height: 100px;*/
    object-fit: cover;
    border-radius: 8px;
  }
  
  .paper-card .card-content {
    flex: 1;
  }
  
  .paper-card h4 {
    margin: 0 0 12px;
    font-size: 1.2em;
    font-weight: 500;
    color: #1d1d1f;
  }
  
  .paper-card h4 a {
    color: #1d1d1f;
    text-decoration: none;
  }
  
  .paper-card h4 a:hover {
    color: #0071e3;
    text-decoration: underline;
  }
  
  .paper-card .authors {
    font-style: italic;
    color: #6e6e73;
    margin-bottom: 12px;
    font-size: 0.95em;
  }
  
  .paper-card .authors strong {
    font-weight: bold;
    color: #1d1d1f;
  }
  
  .paper-card .venue {
    font-weight: 500;
    color: #515154;
    margin-bottom: 16px;
    font-size: 0.9em;
  }
  
  .paper-card .links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .paper-card .links a {
    background: #fff;
    color: #0071e3;
    padding: 6px 12px;
    border: 1px solid #d2d2d7;
    border-radius: 12px;
    text-decoration: none;
    font-size: 0.85em;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .paper-card .links a:hover {
    background: linear-gradient(to right, #C8AEDC, #9AB8E0, #87CDEE);
    color: #ffffff;
    border-color: transparent;
    text-shadow: none;
    filter: none;
    transition: all 0.3s ease;
  }
  
  .timeline-card {
    background: #fff;
    border-left: 4px solid #0071e3;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .timeline-card h4 {
    margin: 0 0 8px;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  .timeline-card .date {
    font-style: italic;
    color: #6e6e73;
    font-size: 0.9em;
    margin-bottom: 8px;
  }
  
  .news ul {
    list-style: none;
    padding: 0;
    margin: 0;
    color: #1d1d1f;
  }
  
  .news ul li {
    margin-bottom: 10px;
    font-size: 0.95em;
  }
  
  details summary {
    cursor: pointer;
    color: #0071e3;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .paper-card {
      flex-direction: column;
      align-items: flex-start;
    }
    .paper-card .card-image {
      width: 100%;
      height: auto;
    }
  }
</style>

Dongli Xu is a PhD student at KU Leuven, supervised by [Matthew Blaschko](https://homes.esat.kuleuven.be/~mblaschk/). He also works as an intern at [SAIS](https://www.sais.com.cn/) and [Everlyn.ai](https://everlyn.app/). He was a research engineer at [NullmaxAI](https://www.nullmax.ai/) (2023-2024) focusing on autonomous driving and generative model. He received his master's degree in the School of Computer Science at the University of Sydney (2021-2023), supervised by [Dr. Chang Xu](http://changxu.xyz). He worked at the University of Electronic Science and Technology of China (2020-2021) with [Prof. Wen Li](http://wenli-vision.github.io/), investigating computer vision in the School of Computer Science and Engineering. He received his B. E. in Computer Science and Technology from Harbin Engineering University (2020) and was advised by [Prof. Jian Guan](http://homepage.hrbeu.edu.cn/web/guanjian1). 

---

## News

<div class="news">
        <!-- <h3 >Updates</h3> -->
        <!--<div style="overflow-y: scroll; height:150px; width:900px">-->
          <td style="border-style: none; border-width: medium;">
            <ul style="text-align:justify;height: 130px; overflow:auto;">
            <li class="font">[Jun. 2025] A paper is accepted by NeurIPS. Congratulations to Tan!</li>
            <li class="font">[Jun. 2025] Two papers are accepted by ICCV. Congratulations to Tan and Congyi!</li>
            <li class="font">[Jun. 2025] I accept the PhD offer at KU Leuven that supported by [Flanders AI Research Program](https://www.flandersairesearch.be/en) </li>
            <details><summary><font color=blue>[More]</font></summary>
                <li class="font">[Dec. 2024] I am looking for a PhD position.</li>
                <li class="font">[Dec. 2024] I can not join CVSSP since the Academic Technology Approval Scheme (ATAS) rejection. ATAS reviews are unfair and discriminatory, targeting Chinese student based on biased criteria rather than facts.</li>
                <li class="font">[Oct. 2024] One paper is accepted by NeurIPS'25. Congratulations to Xuanjia!</li>
                <li class="font">[Aug. 2024] I will be joining the CVSSP as a Ph.D student, under the supervision of [Prof. Wenwu Wang](https://personalpages.surrey.ac.uk/w.wang/) and  the co-supervision of [Prof. Philip J.B. Jackson](https://www.surrey.ac.uk/people/philip-jackson).</li>
                <li class="font">[Dec. 2023] One paper is accepted by ICASSP'24.</li>
                <li class="font">[Nov. 2023] One paper is submiited to CVPR'24. Good Luck!</li>
                <li class="font">[Feb. 2023] One paper is accepted by CVPR'23! Congratulations to Jinhong!</li>
                <li class="font">[Jan. 2023] Graduated from the University of Sydney!</li>
                <li class="font">[Nov. 2022] I will be graduated by this semester!</li>
                <li class="font">[Nov. 2022] Two papers are submitted to CVPR'23.</li>
                <li class="font">[July 2021] Start my master's study at the University of Sydney. </li>
            </details>
            </ul>  
          </td>
          <!--</div>-->
      </div>

---
## Research Interests:
- Computer Vision
  - Object Detection
- Signal/Audio/Speech/Music Processing
- Multimodal
- Generative Model
  - Diffusion
  - Autoregressive Model



<!-- ## Education
### **University of Sydney** `Australia, 2021.8 - 2023.1`
```
- M. in Information Technology
```


### **Harbin Engineering University** `Harbin, China 2016.9 - 2020.6`
```
- B. E. in Computer Science
``` -->


<!-- ## Experience
### **University of Electronic Science and Techology of China** `2020.7 - 2021.8 `

```
Chengdu, Sichuan, P. R. China 
```

- Research Assistant in [Data Intelligence Group](diggers.ai)
- 

### **Harbin Engineering University** `2016.9 - 2020.6`

```
Harbin, Heilongjiang, P. R. China 
```

- Research Assistant in Group of Intelligent Signal Processing
- Co-advised by [Prof. Jian Guan](http://homepage.hrbeu.edu.cn/web/guanjian1), [Dr. Pengming Feng](http://) and [Prof. Wenwu Wang](http://personal.ee.surrey.ac.uk/Personal/W.Wang/) -->

---
## Preprints
<div class="publications-grid">
  <div class="paper-card gold-card">
  <img src="{{page.homepage.url}}/img/papers/2025-10-2-SoftCFG.png" alt="Paper Image" class="card-image">
  <div class="card-content">
    <h4>SoftCFG: Uncertainty-guided Stable Guidance for Visual Autoregressive Model</h4>
    <div class="authors"><strong>Dongli Xu</strong>, Aleksei Tiulpin, Matthew B. Blaschko</div>
    <div class="venue">arXiv preprint, October 2025</div>
    <div class="links">
      <a href="https://arxiv.org/pdf/2510.00996.pdf">PDF</a>
    </div>
  </div>
</div>
  
  <div class="paper-card">
    <img src="{{page.homepage.url}}/img/papers/2025-10-2-ORT.png" alt="Paper Image" class="card-image">
    <div class="card-content">
    <h4>Revisiting Random Generation Order: Ordinal-biased Random Training for Efficient Visual Autoregressive Models</h4>
    <div class="authors"> <strong>Dongli Xu</strong>*, Xuanming Cui*, Tan Pan, Chen Jiang, Yuan Cheng, Harry Yang, Ser-Nam Lim</div>
    <div class="venue">Will be released soon!</div>
    </div>
  </div>
  
  <div class="paper-card">
    <div class="card-content">
    <h4>Exploring the Balance Between Quality and Quantity of Object Queries for Detection Transformer</h4>
    <div class="authors"> <strong>Dongli XU</strong>, Jinhong Deng, Tao Huang, Xiu Su, Shan You, Chang Xu, Wen Li</div>
    <div class="venue">arXiv preprint</div>
    <div class="links">
      <a href="#">PDF</a>
      <a href="{{ site.url }}/papers/balance_queries.bib">BibTeX</a>
      <a href="#">Repo</a>
    </div>
    </div>
  </div>
  
  <div class="paper-card">
    <div class="card-content">
      <h4>Learning to Shift Duplication for NMS-Free One-Stage Object Detection</h4>
      <div class="authors"><strong>Dongli Xu</strong>, Jinhong Deng, Tao Huang, Xiu Su, Shan You, Wen Li, Chang Xu</div>
      <div class="venue">arXiv preprint</div>
      <div class="links">
        <a href="#">PDF</a>
        <a href="{{ site.url }}/papers/shift_duplication.bib">BibTeX</a>
        <a href="#">Repo</a>
      </div>
    </div>
  </div>
</div>


---
## Publications

### 2025
<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://arxiv.org/abs/2509.15791">Minimal Semantic Sufficiency Meets Unsupervised Domain Generalization</a></h4>
    <div class="authors">Tan Pan, Kaiyu Guo, <strong>Dongli Xu</strong>, Zhaorui Tan, Chen Jiang, Deshu Chen, Xin Guo, Brian C. Lovell, Limei Han, Yuan Cheng, Mahsa Baktashmotlagh</div>
    <div class="venue">Annual Conference on Neural Information Processing Systems (NeurIPS), 2025</div>
    <div class="links">
      <a href="https://arxiv.org/pdf/2509.15791">PDF</a>
    </div>
  </div>
</div>

<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://arxiv.org/abs/2507.02581">Structure-aware Semantic Discrepancy and Consistency for 3D Medical Image Self-supervised Learning</a></h4>
    <div class="authors">Tan Pan, Zhaorui Tan, Kaiyu Guo, <strong>Dongli Xu</strong>, Weidi Xu, Chen Jiang, Xin Guo, Yuan Qi, Yuan Cheng</div>
    <div class="venue">IEEE/CVF International Conference on Computer Vision (ICCV), 2025</div>
    <div class="links">
      <a href="https://arxiv.org/pdf/2507.02581">PDF</a>
    </div>
  </div>
</div>

<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://arxiv.org/abs/2503.17340">Align Your Rhythm: Generating Highly Aligned Dance Poses with Gating-Enhanced Rhythm-Aware Feature Representation</a></h4>
    <div class="authors">Congyi Fan, Jian Guan, Xuanjia Zhao, <strong>Dongli Xu</strong>, Youtian Lin, Tong Ye, Pengming Feng, Haiwei Pan</div>
    <div class="venue">IEEE/CVF International Conference on Computer Vision (ICCV), 2025</div>
    <div class="links">
      <a href="https://arxiv.org/abs/2503.17340">PDF</a>
    </div>
  </div>
</div>

<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://arxiv.org/pdf/2412.18235">Band Prompting Aided SAR and Multi-Spectral Data Fusion Framework for Local Climate Zone Classification</a></h4>
    <div class="authors">Haiyan Lan, Shujun Li, Mingjie Xie, Xuanjia Zhao, Hongning Liu, Pengming Feng, <strong>Dongli Xu</strong>, Guangjun He, Jian Guan</div>
    <div class="venue">IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP), 2025</div>
    <div class="links">
      <a href="https://arxiv.org/pdf/2412.18235">PDF</a>
    </div>
  </div>
</div>

### 2024
<div class="paper-card gold-card">
  <div class="card-content">
    <h4><a href="https://fastdrag-site.github.io/">FastDrag: Manipulate Anything in One Step</a></h4>
    <div class="authors">Jiaxuan Zhao, Jian Guan, Congyi Fan, <strong>Dongli Xu</strong>, Youtian Lin, Haiwei Pan, Pengming Feng</div>
    <div class="venue">Annual Conference on Neural Information Processing Systems (NeurIPS), 2024</div>
    <div class="links">
      <a href="https://arxiv.org/pdf/2405.15769">PDF</a>
      <a href="{{page.homepage.url}}/paper/">BibTeX</a>
      <a href="https://github.com/XuanjiaZ/FastDrag">Repo</a>
    </div>
  </div>
</div>

<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://ieeexplore.ieee.org/document/10448501">FPN with GMM Based Feature Enhancement Strategy for Object Detection in Remote Sensing Images</a></h4>
    <div class="authors">Hongning Liu, Pengming Feng, Mingjie Xie, <strong>Dongli Xu</strong>, Jian Guan, Guangjun He, Rubo Zhang</div>
    <div class="venue">IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP), 2024</div>
    <div class="links">
      <a href="https://ieeexplore.ieee.org/document/10448501">PDF</a>
      <a href="{{page.homepage.url}}/paper/">BibTeX</a>
    </div>
  </div>
</div>

### 2023
<div class="paper-card purple-card">
  <div class="card-content ">
    <h4><a href="https://openaccess.thecvf.com/content/CVPR2023/html/Deng_Harmonious_Teacher_for_Cross-Domain_Object_Detection_CVPR_2023_paper.html">Harmonious Teacher for Cross-domain Object Detection</a></h4>
    <div class="authors">Jinhong Deng, <strong>Dongli Xu</strong>, Wen Li, Lixing Duan</div>
    <div class="venue">IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2023 </div>
    <div class="links">
      <a href="https://openaccess.thecvf.com/content/CVPR2023/papers/Deng_Harmonious_Teacher_for_Cross-Domain_Object_Detection_CVPR_2023_paper.pdf">PDF</a>
      <a href="{{page.homepage.url}}/paper/2023_CVPR_HarmoniousTeacher.txt">BibTeX</a>
      <a href="https://github.com/kinredon/Harmonious-Teacher">Repo</a>
    </div>
  </div>
</div>

### 2022
<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://openaccess.thecvf.com/content/CVPR2022/html/Xu_Revisiting_AP_Loss_for_Dense_Object_Detection_Adaptive_Ranking_Pair_CVPR_2022_paper.html">Revisiting AP Loss for Dense Object Detection: Adaptive Ranking Pair Selection</a></h4>
    <div class="authors"><strong>Dongli Xu</strong>, Jinhong Deng, Wen Li</div>
    <div class="venue">IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2022</div>
    <div class="links">
      <a href="https://openaccess.thecvf.com/content/CVPR2022/papers/Xu_Revisiting_AP_Loss_for_Dense_Object_Detection_Adaptive_Ranking_Pair_CVPR_2022_paper.pdf">PDF</a>
      <a href="{{page.homepage.url}}/paper/2022_CVPR_APELoss.txt">BibTeX</a>
      <a href="https://github.com/Xudangliatiger/APE-Loss">Repo</a>
    </div>
  </div>
</div>

### 2020
<div class="paper-card">
  <div class="card-content">
    <h4><a href="https://ieeexplore.ieee.org/document/9153932">Association Loss for Visual Object Detection</a></h4>
    <div class="authors"><strong>Dongli Xu</strong>, Jian Guan, Pengming Feng, Wenwu Wang</div>
    <div class="venue">IEEE Signal Processing Letters (SPL), 2020 </div>
    <div class="links">
      <a href="http://epubs.surrey.ac.uk/858303/1/XuGFW_SPL_2020.pdf">PDF</a>
      <a href="{{page.homepage.url}}/paper/2020_SPL_associationLoss.txt">BibTeX</a>
      <a href="https://github.com/Xudangliatiger/AssociationLoss">Repo</a>
    </div>
  </div>
</div>

## Honors & Awards
The Second Award of CAAI The 4th Chinese Youth Congress on Artificial Intelligence  `Shenzhen, Dec 2018` <br>



<!-- ## Contact Details

TEL: +86-188-4579-3185<br>
Email: [dongliixu@gmail](mailto:dongliixu@gmail)<br> -->

<!-- CHI'20 Best Paper Honourable Mention Award `CMU, 2020` <br> -->
<!-- Phi Beta Kappa `Dickinson, 2018` <br>
Excellence in Computer Science Award `Columbia, 2018` <br>
Travel Award PL Mentoring Workshop (PLMW) `SPLASH, 2018` <br>
Tau Beta Pi, Engineering Honor Society `Columbia, 2017` <br>
Computer Science Departmental Honors `Dickinson, 2016` <br>
Pi Mu Epsilon, Mathematics Honor Society `Dickinson, 2016` <br>
Upsilon Pi Epsilon, Computer Science Honor Society `Dickinson, 2016` <br>
Alpha Lambda Delta, First year Honor Society `Dickinson, 2013`<br>
John Montgomery Scholarship `Dickinson, 2013` <br> -->



<!-- ## Teaching -->

<!-- Teaching Assistant, **Programming Languages and Translators (COMS 4115)** `Columbia, 2017 - 2018` <br>
Teaching Assistant, **Introduction to Java II (COMP 132)** `Dickinson, 2016` <br>
Peer Tutor, **Data Structures and Problem Solving (COMP 232)** `Dickinson, 2016` <br>
Computer Lab Consultant `Dickinson, 2014 - 2016` <br> -->


## Service

Conference Reviewer: `CVPR, 2023-2025` `ICCV, 2025` `ECCV, 2024` `ICLR, 2025` `NeurIPS, 2024-2025` `AAAI, 2025` `ICASSP, 2024-2025`<br>
Journal Reviewer: `ACM Computing Surveys, 2023`

---
### Footer
Last updated: Jun. 2025
