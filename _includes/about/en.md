
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
    box-shadow: 0 12px 40px rgba(255,215,0, 0.3), /* 增强金色悬停光晕 */
                0 0 25px rgba(218, 165, 32, 0.2),
                0 6px 15px rgba(0, 0, 0, 0.1);
  }
  .paper-card .card-image {
    flex: 0 0 300px; /* 桌面端固定宽度 */
    width: 100%; /* 响应式宽度 */
    max-width: 300px; /* 桌面端最大宽度 */
    height: auto; /* 自动调整高度 */
    object-fit: contain; /* 完整显示图片 */
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
    
    color: #6e6e73;
    margin-bottom: 12px;
    font-size: 0.95em;
  }
  
  .paper-card .authors strong {
    font-weight: bold;
    color: #1d1d1f;
  }
  
  .paper-card .venue {
    font-style: italic;
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
      max-width: 100%;
      height: auto; /* 自动高度 */
      object-fit: contain; /* 完整显示 */
      margin-bottom: 15px; /* 间距 */
      flex: 0 0 auto; /* 移除固定宽度约束 */
    }
    .paper-card .card-content {
      width: 100%;
    }}

.timeline {
  position: relative;
  margin: 30px 0;
  padding-left: 25px;
  border-left: 3px solid #d4b56f;
  font-size: 15px;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 15px;
}

.timeline-date {
  color: #333;
  font-weight: bold;
  margin-bottom: 5px;
}

.timeline-content {
  border-radius: 8px;
  line-height: 1.6em;
  padding: 10px 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
  color: #333;
  background: #f4f7fc; /* 比原来更深一点的蓝底 */
}


.timeline-content a {
  color: #0056d6;
  text-decoration: none;
  font-weight: 500;
}

.timeline-content a:hover {
  text-decoration: underline;
}

/* 默认蓝圆点 */
.timeline-item::before {
  content: "";
  position: absolute;
  left: -11px;
  top: 6px;
  width: 12px;
  height: 12px;
  background-color: #0056d6;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #fff;
}

/* “Show more” 按钮 */
.timeline-more summary {
  cursor: pointer;
  font-weight: 600;
  color: #d4b56f;
  margin-top: 12px;
  padding-left: 10px;
}
.timeline-more summary:hover {
  text-decoration: underline;
  color: #b68936;
}

/* 金色强调项 */
.timeline-item.gold::before {
  background-color: #d4b56f;
}

.timeline-item.gold .timeline-content {
  background: #fdf7eb; /* 更亮的淡金色 */
  /*border: 1px solid #e3cc96; !* 加一点边线对比 *!*/
 /*box-shadow: 0 8px 15px rgba(184, 134, 11, 0.2), !* 更浓郁的金色光晕 *!*/
 /*               0 0 10px rgba(218, 165, 32, 0.15), !* 亮金微光 *!*/
 /*               0 4px 5px rgba(0, 0, 0, 0.05);*/
}
</style>



Dongli Xu is a PhD student at KU Leuven, supervised by [Prof. Matthew Blaschko](https://homes.esat.kuleuven.be/~mblaschk/). He also works as an intern at [SAIS](https://www.sais.com.cn/) and [Everlyn.ai](https://everlyn.app/). He was a research engineer at [NullmaxAI](https://www.nullmax.ai/) (2023-2024) focusing on autonomous driving and generative model. He received his master's degree in the School of Computer Science at the University of Sydney (2021-2023), supervised by [Dr. Chang Xu](http://changxu.xyz). He worked at the University of Electronic Science and Technology of China (2020-2021) with [Prof. Wen Li](http://wenli-vision.github.io/), investigating computer vision in the School of Computer Science and Engineering. He received his B. E. in Computer Science and Technology from Harbin Engineering University (2020) and was advised by [Prof. Jian Guan](http://homepage.hrbeu.edu.cn/web/guanjian1). 

---
## Research Interests:
- Computer Vision
  - Object Detection
- Signal/Audio/Speech/Music Processing
- Multimodal
- Generative Model
  - Diffusion
  - Autoregressive Model

---
## 📰 News

<div class="timeline">
  <!-- 2026 -->
  <div class="timeline-item gold">
    <div class="timeline-date">Jul. 2026</div>
    <div class="timeline-content">
      I am looking for a research internship on <b>World Models</b>, <b>Unified Models</b>, or <b>Multimodal Models</b>. Please feel free to reach out!
    </div>
  </div>

  <div class="timeline-item normal">
    <div class="timeline-date">Jun. 2026</div>
    <div class="timeline-content">
      Our work <a href="https://openaccess.thecvf.com/content/CVPR2026/html/Xie_SynCLIP_Synonym-Coherent_Language-Image_Pretraining_for_Robust_Open-Vocabulary_Dense_Perception_CVPR_2026_paper.html" target="_blank"><b>SynCLIP</b></a> is published at <b>CVPR 2026</b>. Congratulations to <b>Mingjie</b> and <b>Guangjun</b>!
    </div>
  </div>

  <div class="timeline-item normal">
    <div class="timeline-date">Jun. 2026</div>
    <div class="timeline-content">
      Our work on <a href="https://ieeexplore.ieee.org/abstract/document/11558459/" target="_blank"><b>frequency-phase aware Mamba fusion</b></a> is published in <b>IEEE TGRS</b>. Congratulations to <b>Xinyue</b> and <b>Hongning</b>!
    </div>
  </div>

  <div class="timeline-item gold">
    <div class="timeline-date">May 2026</div>
    <div class="timeline-content">
      Our next EuroHPC project, <a href="https://www.eurohpc-ju.europa.eu/pixelgen-high-resolution-pixel-space-generation-diffusion-and-autoregression_en" target="_blank"><b>PixelGen: High-Resolution Pixel-Space Generation with Diffusion and Autoregression</b></a>, has been awarded <b>160,000 A100 GPU hours</b> on the <b>Leonardo BOOSTER</b> supercomputer 🎉
    </div>
  </div>

  <!-- 2025 -->
  <div class="timeline-item normal">
    <div class="timeline-date">Jan. 2026</div>
    <div class="timeline-content">
      Two papers are accepted by <b>ICLR</b>. Congratulations to <b>Rui</b>!
    </div>
  </div> 
  <div class="timeline-item normal">
    <div class="timeline-date">Jan. 2026</div>
    <div class="timeline-content">
      A paper is accepted by <b>ICASSP</b>. Congratulations to <b>Congyi</b>!
    </div>
  </div> 
  

  <div class="timeline-item gold">
    <div class="timeline-date">Oct. 2025</div>
    <div class="timeline-content">
      My research proposal on <b>next-generation visual AR models</b> has been approved by 
      <a href="https://eurohpc-ju.europa.eu" target="_blank">EuroHPC AI Factory for Science and Collaborative EU Projects</a>, granting <b>80,000 H100 GPU hours</b> on the <a href="https://www.bsc.es/marenostrum/marenostrum-5" target="_blank">MareNostrum5</a> supercomputer 🎉  
      Thanks to <b>Sebastian</b>, <b>Teodora</b>, and <b>Matthew</b> for the support!
    </div>
  </div>

  <div class="timeline-item normal">
    <div class="timeline-date">Jun. 2025</div>
    <div class="timeline-content">
      A paper is accepted by <b>NeurIPS</b>. Congratulations to <b>Tan</b>!
    </div>
  </div>

  <div class="timeline-item ">
    <div class="timeline-date">Jun. 2025</div>
    <div class="timeline-content">
      Two papers are accepted by <b>ICCV</b>. Congratulations to <b>Tan</b> and <b>Congyi</b>!
    </div>
  </div>

  <div class="timeline-item gold" >
    <div class="timeline-date">Jun. 2025</div>
    <div class="timeline-content">
      I accept the PhD offer at <b>KU Leuven</b>, supported by the 
      <a href="https://www.flandersairesearch.be/en" target="_blank">Flanders AI Research Program</a>.
    </div>
  </div>

<details class="timeline-more">
    <summary>Show more history</summary>

<div class="timeline-item">
  <div class="timeline-date">Dec. 2024</div>
  <div class="timeline-content">I am looking for a PhD position.</div>
</div>

<div class="timeline-item gold">
  <div class="timeline-date">Dec. 2024</div>
  <div class="timeline-content">
    I cannot join CVSSP since the Academic Technology Approval Scheme (ATAS) rejection.  
    ATAS reviews are <b>unfair and discriminatory</b>, targeting Chinese students.
  </div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Oct. 2024</div>
  <div class="timeline-content">
    One paper is accepted by <b>NeurIPS’25</b>. Congratulations to <b>Xuanjia</b>!
  </div>
</div>

<div class="timeline-item gold">
  <div class="timeline-date">Aug. 2024</div>
  <div class="timeline-content">
    I will be joining <b>CVSSP</b> as a Ph.D. student under  
    <a href="https://personalpages.surrey.ac.uk/w.wang/" target="_blank">Prof. Wenwu Wang</a>  
    and co-supervised by  
    <a href="https://www.surrey.ac.uk/people/philip-jackson" target="_blank">Prof. Philip J.B. Jackson</a>.
  </div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Dec. 2023</div>
  <div class="timeline-content">One paper is accepted by <b>ICASSP’24</b>.</div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Nov. 2023</div>
  <div class="timeline-content">One paper is <b>submitted to CVPR’24</b>. Good luck!</div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Feb. 2023</div>
  <div class="timeline-content">One paper is accepted by <b>CVPR’23</b>! Congratulations to <b>Jinhong</b>!</div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Jan. 2023</div>
  <div class="timeline-content">Graduated from the <b>University of Sydney</b>!</div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Nov. 2022</div>
  <div class="timeline-content">I will graduate this semester!</div>
</div>

<div class="timeline-item">
  <div class="timeline-date">Nov. 2022</div>
  <div class="timeline-content">Two papers are submitted to <b>CVPR’23</b>.</div>
</div>

<div class="timeline-item gold">
  <div class="timeline-date">Jul. 2021</div>
  <div class="timeline-content">Started my master's study at the <b>University of Sydney</b>.</div>
</div>
  </details>

</div>








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



---
## Publications
### 2026
<div class="publications-grid">
  <div class="paper-card">
    <div class="card-content">
      <h4><a href="https://ieeexplore.ieee.org/abstract/document/11558459/">Frequency-Phase Aware Mamba Fusion for Multi-scale Spatial Representation in Remote Sensing Image Interpretation</a></h4>
      <div class="authors">Xinyue Liu, Hongning Liu, Mingjie Xie, <strong>Dongli Xu</strong>, Xianchao Zhang, Pengming Feng, Jian Guan</div>
      <div class="venue">IEEE Transactions on Geoscience and Remote Sensing (TGRS), 2026</div>
      <div class="links">
        <a href="https://ieeexplore.ieee.org/abstract/document/11558459/">Paper</a>
      </div>
    </div>
  </div>
</div>

<div class="publications-grid">
  <div class="paper-card">
    <div class="card-content">
      <h4><a href="https://openaccess.thecvf.com/content/CVPR2026/html/Xie_SynCLIP_Synonym-Coherent_Language-Image_Pretraining_for_Robust_Open-Vocabulary_Dense_Perception_CVPR_2026_paper.html">SynCLIP: Synonym-Coherent Language-Image Pretraining for Robust Open-Vocabulary Dense Perception</a></h4>
      <div class="authors">Mingjie Xie, Guangjun He, <strong>Dongli Xu</strong>, Youtian Lin, Hongjue Li, Pengming Feng, Jian Guan, Yue Deng</div>
      <div class="venue">IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2026</div>
      <div class="links">
        <a href="https://openaccess.thecvf.com/content/CVPR2026/papers/Xie_SynCLIP_Synonym-Coherent_Language-Image_Pretraining_for_Robust_Open-Vocabulary_Dense_Perception_CVPR_2026_paper.pdf">PDF</a>
        <a href="https://github.com/Justlovesmile/SynCLIP">Repo</a>
      </div>
    </div>
  </div>
</div>

<div class="publications-grid">
  <div class="paper-card gold-card">
  <img src="/img/papers/2025-10-2-SoftCFG.png" alt="Paper Image" class="card-image">
  <div class="card-content">
    <h4>SoftCFG: Uncertainty-guided Stable Guidance for Visual Autoregressive Model</h4>
    <div class="authors"><strong>Dongli Xu</strong>, Aleksei Tiulpin, Matthew B. Blaschko</div>
    <div class="venue">International Conference on Learning Representations (ICLR), 2026</div>
    <div class="links">
        <a href="https://arxiv.org/pdf/2510.00996.pdf">PDF</a>
        <a href="https://github.com/Xudangliatiger/SoftCFG">Repo</a>
    </div>
  </div>
</div>
</div>

<div class="publications-grid">
  <div class="paper-card">
  <div class="card-content">
    <h4>Disco: Densely-overlapping Cell Instance Segmentation via Adjacency-aware Collaborative Coloring</h4>
    <div class="authors">Rui Sun, Yiwen Yang, Kaiyu Guo, Chen Jiang, <strong>Dongli Xu</strong>, Zhaonan Liu, Tan Pan, Limei HAN, Xue Jiang, Wu Wei, Yuan Cheng</div>
    <div class="venue">International Conference on Learning Representations (ICLR), 2026</div>
  </div>
</div>
</div>

<div class="publications-grid">
  <div class="paper-card">
  <div class="card-content">
    <h4>Physics-aware Novel-view Acoustic Synthesis with Vision-language Priors and 3D Acoustic Environment Modeling</h4>
    <div class="authors">Congyi Fan, Jian Guan, Youtian Lin, <strong>Dongli Xu</strong>,, Tong Ye, Qiaoxi Zhu, Pengming Feng, Wenwu Wang</div>
    <div class="venue">IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP), 2026</div>
  </div>
</div>
</div>

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
<div class="paper-card gold-card">
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
Last updated: Jul. 2026
