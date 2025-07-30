// 전역 변수
let generatedPrompt = "";
let currentStep = 1;

// DOM이 로드된 후 초기화
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  initializeStepAnimation();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
  // 라디오 버튼 카드 클릭 이벤트
  const selectionCards = document.querySelectorAll(".selection-card");
  selectionCards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
  });

  // 실제 라디오 버튼 변경 이벤트
  const languageRadios = document.querySelectorAll('input[name="language"]');
  languageRadios.forEach((radio) => {
    radio.addEventListener("change", handleLanguageChange);
  });

  // 생성 버튼 이벤트
  const generateBtn = document.getElementById("generateBtn");
  generateBtn.addEventListener("click", generatePrompt);

  // 다운로드 버튼 이벤트
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.addEventListener("click", downloadPrompt);

  // 폼 입력 시 실시간 검증
  const requiredInputs = document.querySelectorAll(
    "#projectName, #projectType"
  );
  requiredInputs.forEach((input) => {
    input.addEventListener("input", validateForm);
  });
}

// 카드 클릭 핸들러
function handleCardClick(event) {
  const card = event.currentTarget;
  const radioName = card.dataset.radio;
  const radioValue = card.dataset.value;
  const radioInput = card.querySelector('input[type="radio"]');

  if (!radioInput || !radioName) return;

  // 같은 그룹의 다른 카드들 선택 해제
  const sameGroupCards = document.querySelectorAll(
    `[data-radio="${radioName}"]`
  );
  sameGroupCards.forEach((c) => c.classList.remove("selected"));

  // 현재 카드 선택
  card.classList.add("selected");
  radioInput.checked = true;

  // change 이벤트 발생
  radioInput.dispatchEvent(new Event("change", { bubbles: true }));
}

// 언어 선택 변경 핸들러
function handleLanguageChange(event) {
  const selectedLanguage = event.target.value;

  // 모든 세부 선택 섹션 숨김
  const phpDetails = document.getElementById("phpDetails");
  const reactDetails = document.getElementById("reactDetails");

  phpDetails.classList.add("hidden");
  reactDetails.classList.add("hidden");

  // 선택된 언어에 따른 세부 섹션 표시
  setTimeout(() => {
    if (selectedLanguage === "php") {
      phpDetails.classList.remove("hidden");
      phpDetails.classList.add("visible");
    } else if (selectedLanguage === "react") {
      reactDetails.classList.remove("hidden");
      reactDetails.classList.add("visible");
    }
  }, 300);

  // 폼 검증
  validateForm();
}

// 단계별 애니메이션 초기화
function initializeStepAnimation() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px 0px -50px 0px",
    }
  );

  const steps = document.querySelectorAll(".step-section");
  steps.forEach((step) => {
    observer.observe(step);
  });
}

// 폼 검증
function validateForm() {
  const projectName = document.getElementById("projectName").value.trim();
  const projectType = document.getElementById("projectType").value;
  const language = document.querySelector('input[name="language"]:checked');

  const generateBtn = document.getElementById("generateBtn");

  if (projectName && projectType && language) {
    generateBtn.disabled = false;
    generateBtn.style.opacity = "1";
  } else {
    generateBtn.disabled = true;
    generateBtn.style.opacity = "0.6";
  }
}

// 프롬프트 생성
function generatePrompt() {
  const generateBtn = document.getElementById("generateBtn");

  // 버튼 로딩 상태
  generateBtn.innerHTML =
    '<div class="loading-spinner"></div><span>생성 중...</span>';
  generateBtn.disabled = true;

  // 폼 데이터 수집
  const formData = collectFormData();

  setTimeout(() => {
    // 프롬프트 텍스트 생성
    generatedPrompt = generatePromptText(formData);

    // 미리보기 표시
    displayPreview();

    // 버튼 원상 복구
    generateBtn.innerHTML = "<span>🎯 전문 AI 지침 생성하기</span>";
    generateBtn.disabled = false;

    // 미리보기로 스크롤
    document.getElementById("previewSection").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 1500);
}

// 폼 데이터 수집
function collectFormData() {
  const data = {};

  // 기본 정보
  data.language =
    document.querySelector('input[name="language"]:checked')?.value || "";
  data.phpType =
    document.querySelector('input[name="phpType"]:checked')?.value || "";
  data.reactType =
    document.querySelector('input[name="reactType"]:checked')?.value || "";
  data.projectName = document.getElementById("projectName").value.trim();
  data.projectType = document.getElementById("projectType").value;
  data.businessDomain = document.getElementById("businessDomain").value.trim();
  data.additionalTools = document
    .getElementById("additionalTools")
    .value.trim();
  data.performance = document.getElementById("performance").value.trim();
  data.security = document.getElementById("security").value.trim();

  // 체크박스 데이터
  data.databases = Array.from(
    document.querySelectorAll('input[name="database"]:checked')
  ).map((cb) => cb.value);
  data.workScope = Array.from(
    document.querySelectorAll('input[name="workScope"]:checked')
  ).map((cb) => cb.value);

  return data;
}

// 프롬프트 텍스트 생성
function generatePromptText(data) {
  const subType = data.phpType || data.reactType || "";
  const projectName = data.projectName || "프로젝트";
  const projectType = data.projectType || "웹 애플리케이션";
  const businessDomain = data.businessDomain || "비즈니스";

  return `# ${projectName} - 전문 AI 개발 지침

## 🎯 역할 정의
당신은 **${getLanguageDescription(data.language, subType)}** 전문 개발자입니다.
${businessDomain} 도메인의 ${projectType} 개발에 특화된 전문가로서 활동합니다.

## 🛠️ 기술 스택 및 환경
### 주요 언어/프레임워크
${getTechStackDescription(data.language, subType)}

### 데이터베이스
${
  data.databases.length > 0
    ? data.databases.join(", ")
    : "프로젝트 요구사항에 따라 결정"
}

### 추가 도구/라이브러리
${data.additionalTools || "기본 도구셋 사용"}

## 📋 프로젝트 컨텍스트
- **프로젝트명**: ${projectName}
- **프로젝트 유형**: ${getProjectTypeDescription(projectType)}
- **비즈니스 도메인**: ${businessDomain}
- **주요 작업 범위**: ${
    data.workScope.length > 0 ? data.workScope.join(", ") : "전반적인 웹 개발"
  }

## 💡 핵심 개발 원칙
${getDevelopmentPrinciples(data.language, subType)}

## 📝 코딩 표준 및 규칙
${getCodingRules(data.language, subType)}

## ⚡ 성능 및 보안 요구사항
${
  data.performance
    ? `### 성능 목표\n- ${data.performance}\n`
    : "### 성능 목표\n- 표준 웹 성능 지표 준수\n- 사용자 경험 최적화\n"
}
${
  data.security
    ? `### 보안 요구사항\n- ${data.security}\n`
    : "### 보안 요구사항\n- 기본 웹 보안 표준 적용\n- 데이터 보호 및 안전한 인증\n"
}

## 🎨 응답 및 작업 가이드라인

### 코드 제공 시 필수 사항
1. **완전성**: 즉시 실행 가능한 완전한 코드만 제공
2. **품질**: 에러 처리, 유효성 검사, 보안 고려사항 포함
3. **문서화**: 상세한 주석과 설명 추가
4. **테스트**: 가능한 경우 테스트 코드 함께 제공
5. **최적화**: 성능과 유지보수성을 고려한 구조

### 설명 방식
- 논리적 순서에 따른 단계별 상세 설명
- 실제 동작하는 구체적인 예시 코드 포함
- 성능, 보안, 확장성 고려사항 명시
- 필요시 여러 구현 방법과 장단점 비교 제시

### 절대 금지사항
- ❌ 추측이나 불확실한 정보 제공 금지
- ❌ 불완전하거나 작동하지 않는 코드 제공 금지
- ❌ 검증되지 않은 라이브러리나 방법론 권장 금지
- ❌ 보안 취약점이 있는 코드 제공 금지
- ❌ 프로젝트 컨텍스트를 무시한 일반적인 답변 금지

## 🔄 작업 우선순위 및 프로세스
1. **요구사항 분석**: 비즈니스 로직과 기술적 제약사항 파악
2. **아키텍처 설계**: 확장 가능하고 유지보수 가능한 구조 설계
3. **핵심 기능 구현**: 비즈니스 가치가 높은 기능부터 우선 개발
4. **사용자 인터페이스**: 직관적이고 반응형인 UI/UX 구현
5. **데이터 처리**: 효율적인 데이터 저장, 조회, 처리 로직
6. **성능 최적화**: 응답 시간, 메모리 사용량, 확장성 개선
7. **보안 강화**: 인증, 권한, 데이터 보호 강화
8. **테스트 및 품질 보증**: 자동화 테스트, 코드 리뷰, 디버깅

## ✅ 품질 검증 체크리스트
- [ ] 모든 기능 요구사항 완전히 충족
- [ ] 프로젝트 코딩 표준 및 컨벤션 준수
- [ ] 성능 요구사항 만족 (응답시간, 처리량)
- [ ] 보안 취약점 없음 (SQL Injection, XSS, CSRF 등)
- [ ] 크로스 브라우저 호환성 (필요시)
- [ ] 반응형 디자인 적용 (웹 프로젝트)
- [ ] 에러 처리 및 예외 상황 대응
- [ ] 코드 문서화 및 주석 완료
- [ ] 테스트 커버리지 충족
- [ ] 배포 준비 완료

## 🚀 최종 목표
이 지침에 따라 **${projectName}** 프로젝트의 성공적인 개발을 위한 전문적이고 실용적인 솔루션을 제공하세요. 
모든 답변은 실제 운영 환경에서 바로 사용할 수 있는 수준의 품질을 유지해야 합니다.

---
*이 지침은 ${new Date().toLocaleDateString("ko-KR")}에 생성되었습니다.*`;
}

// 언어별 설명 생성
function getLanguageDescription(language, subType) {
  const descriptions = {
    php: {
      plain: "순수 PHP 기반 평면구조 웹 애플리케이션",
      cms: "CMS(그누보드5, 워드프레스 등) 기반 함수형 개발",
      laravel: "Laravel 프레임워크 기반 MVC 아키텍처",
    },
    react: {
      cra: "Create React App 기반 SPA(Single Page Application)",
      nextjs: "Next.js 기반 풀스택 React 애플리케이션",
      vite: "Vite React 기반 고성능 프론트엔드 애플리케이션",
      native: "React Native 기반 크로스플랫폼 모바일 앱",
    },
  };

  return (
    descriptions[language]?.[subType] || `${language} 기반 웹 애플리케이션`
  );
}

// 기술 스택 설명 생성
function getTechStackDescription(language, subType) {
  const stacks = {
    php: {
      plain: `- PHP 8.0+ (순수 PHP)
- HTML5, CSS3, Vanilla JavaScript
- 평면 파일 구조 (No Framework)
- Apache/Nginx 웹서버`,
      cms: `- PHP 7.4+
- 기존 CMS 코어 시스템 활용
- 테마/플러그인 아키텍처
- Hook과 Filter 시스템`,
      laravel: `- Laravel 10.x/11.x
- PHP 8.1+
- Composer 의존성 관리
- Eloquent ORM
- Artisan CLI 도구`,
    },
    react: {
      cra: `- React 18+
- TypeScript 5.x
- Create React App 툴체인
- React Router v6
- CSS Modules/Styled Components`,
      nextjs: `- Next.js 14+ (App Router)
- React 18+
- TypeScript 5.x
- Server Components
- API Routes`,
      vite: `- Vite 5.x
- React 18+
- TypeScript 5.x
- ESBuild/SWC
- Hot Module Replacement`,
      native: `- React Native 0.72+
- TypeScript 5.x
- Expo SDK/React Native CLI
- React Navigation
- Native Modules`,
    },
  };

  return stacks[language]?.[subType] || `${language} 기반 표준 기술 스택`;
}

// 프로젝트 유형 설명
function getProjectTypeDescription(type) {
  const descriptions = {
    erp: "ERP(전사적 자원 관리) 시스템",
    crm: "CRM(고객 관계 관리) 시스템",
    cms: "콘텐츠 관리 시스템",
    ecommerce: "이커머스 플랫폼",
    blog: "블로그/포털 사이트",
    dashboard: "대시보드/관리자 패널",
    api: "REST API 서버",
    mobile: "모바일 애플리케이션",
    custom: "맞춤형 웹 애플리케이션",
  };

  return descriptions[type] || type;
}

// 개발 원칙 생성
function getDevelopmentPrinciples(language, subType) {
  const principles = {
    php: {
      plain: `- **단순성과 명확성**: 복잡한 구조보다는 이해하기 쉬운 직관적인 코드
- **보안 최우선**: SQL Injection, XSS, CSRF 공격 방지 필수
- **성능 최적화**: 효율적인 DB 쿼리와 캐싱 전략 활용
- **모듈화**: 재사용 가능한 함수와 인클루드 파일 구조`,
      cms: `- **기존 구조 존중**: CMS의 기본 아키텍처와 컨벤션 준수
- **Hook 시스템 활용**: 코어 수정 없이 확장 가능한 구조
- **호환성 유지**: 업데이트 시에도 안정적으로 동작하는 코드
- **플러그인 철학**: 독립적이고 재사용 가능한 모듈 개발`,
      laravel: `- **SOLID 원칙 준수**: 객체지향 설계 원칙 철저히 적용
- **Laravel Way**: 프레임워크의 컨벤션과 베스트 프랙티스 따르기
- **Eloquent 활용**: ORM을 통한 우아한 데이터베이스 조작
- **서비스 컨테이너**: 의존성 주입과 IoC 컨테이너 적극 활용`,
    },
    react: {
      cra: `- **컴포넌트 재사용성**: 작고 독립적인 컴포넌트 설계
- **단방향 데이터 플로우**: Props Down, Events Up 패턴
- **React Hooks**: 함수형 컴포넌트와 커스텀 훅 적극 활용
- **성능 최적화**: 메모이제이션과 지연 로딩 전략`,
      nextjs: `- **Full-Stack 사고**: SSR, SSG, CSR의 적절한 조합 활용
- **성능 우선**: Image 최적화, 코드 스플리팅, 프리패칭
- **SEO 친화적**: 메타데이터와 구조화된 데이터 최적화
- **API Routes**: 서버리스 함수를 통한 백엔드 로직 구현`,
      vite: `- **개발자 경험**: 빠른 HMR과 모던 개발 도구 활용
- **ES6+ 적극 활용**: 최신 JavaScript 기능과 모듈 시스템
- **트리 쉐이킹**: 불필요한 코드 제거로 번들 크기 최적화
- **타입 안정성**: TypeScript를 통한 런타임 에러 방지`,
      native: `- **플랫폼 최적화**: iOS/Android 각각의 UX 가이드라인 준수
- **네이티브 성능**: 60fps 유지와 메모리 효율성 고려
- **반응형 디자인**: 다양한 화면 크기와 해상도 대응
- **디바이스 기능**: 카메라, GPS, 푸시 알림 등 네이티브 API 활용`,
    },
  };

  return principles[language]?.[subType] || "표준 개발 원칙 적용";
}

// 코딩 규칙 생성
function getCodingRules(language, subType) {
  const rules = {
    php: {
      plain: `- **PSR 표준**: PSR-1, PSR-2, PSR-4 표준 엄격히 준수
- **네이밍 컨벤션**: 
* 함수명: snake_case (예: get_user_info)
* 클래스명: PascalCase (예: UserManager)
* 상수명: UPPER_SNAKE_CASE (예: MAX_LOGIN_ATTEMPTS)
- **파일 구조**: 논리적 디렉토리 구조와 명확한 파일명
- **보안 코딩**: 입력 검증, 출력 이스케이핑, prepared statement 필수`,
      cms: `- **CMS 컨벤션**: 해당 CMS의 네이밍 규칙 철저히 준수
- **네임스페이스**: 전역 네임스페이스 오염 방지를 위한 접두어 사용
- **Hook 명명**: 의미있고 충돌하지 않는 훅 이름 사용
- **기존 함수 존중**: 코어 함수와 충돌 방지 및 래퍼 함수 활용`,
      laravel: `- **Laravel 컨벤션**: 프레임워크 표준 네이밍 규칙 준수
- **모델**: PascalCase (User, OrderItem)
- **컨트롤러**: PascalCase + Controller (UserController)
- **마이그레이션**: snake_case 동사형 (create_users_table)
- **라우트**: kebab-case URI (api/user-profiles)`,
    },
    react: {
      cra: `- **컴포넌트명**: PascalCase (UserProfile, NavigationBar)
- **파일명**: 컴포넌트와 동일한 PascalCase
- **Props/State**: camelCase (userData, isLoading)
- **상수**: UPPER_SNAKE_CASE (API_ENDPOINTS)
- **이벤트 핸들러**: handle 접두어 (handleSubmit, handleClick)`,
      nextjs: `- **페이지 파일**: kebab-case (user-profile.tsx)
- **API 라우트**: RESTful 네이밍 (/api/users/[id])
- **컴포넌트**: app/components 디렉토리 구조
- **유틸리티**: lib/utils 폴더에 helper 함수 분리`,
      vite: `- **모듈 구조**: 기능별 폴더 구조 (features, components, utils)
- **Import/Export**: 명시적 named export 선호
- **환경변수**: VITE_ 접두어 필수
- **빌드 최적화**: dynamic import와 코드 스플리팅 고려`,
      native: `- **컴포넌트**: screen, component 폴더 분리
- **스타일**: StyleSheet.create 사용
- **네이티브 모듈**: platform specific 파일 명명 (.ios.ts, .android.ts)
- **타입 정의**: React Native 전용 타입 활용`,
    },
  };

  return rules[language]?.[subType] || "표준 코딩 규칙 적용";
}

// 미리보기 표시
function displayPreview() {
  const previewSection = document.getElementById("previewSection");
  const previewText = document.getElementById("previewText");

  previewText.textContent = generatedPrompt;
  previewSection.classList.remove("hidden");
}

// 파일 다운로드
function downloadPrompt() {
  if (!generatedPrompt) {
    alert("먼저 AI 지침을 생성해주세요.");
    return;
  }

  const projectName =
    document.getElementById("projectName").value.trim() || "project";
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${projectName}_AI_Guidelines_${timestamp}.txt`;

  const blob = new Blob([generatedPrompt], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // 다운로드 성공 피드백
  const downloadBtn = document.getElementById("downloadBtn");
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = "<span>✅</span>다운로드 완료!";
  downloadBtn.style.background =
    "linear-gradient(135deg, var(--success), var(--accent))";

  setTimeout(() => {
    downloadBtn.innerHTML = originalText;
    downloadBtn.style.background =
      "linear-gradient(135deg, var(--secondary), var(--secondary-light))";
  }, 2000);
}

// 초기 폼 검증 실행
setTimeout(validateForm, 100);
