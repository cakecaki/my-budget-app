const form = document.getElementById('expenseForm');
const list = document.getElementById('expenseList');
const categoryTotals = document.getElementById('categoryTotals');
const cardTotals = document.getElementById('cardTotals');
const totalSum = document.getElementById('totalSum');
const monthTabs = document.querySelectorAll('#monthTabs button');
const installmentType = document.getElementById('installmentType');
const installmentMonthsInput = document.getElementById('installmentMonths');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let selectedMonth = 0; // 전체

// 할부 선택 시 개월 입력 활성화
installmentType.addEventListener('change', () => {
  installmentMonthsInput.disabled = installmentType.value !== '할부';
});

function renderExpenses() {
  list.innerHTML = '';
  categoryTotals.innerHTML = '';
  cardTotals.innerHTML = '';

  let categorySum = { 고정지출: 0, 생활비: 0, 식비: 0, 쇼핑: 0 };
  let cardSum = { 삼성: 0, 현대: 0, 우리: 0, 국민: 0, 농협: 0 };
  let total = 0;

  const filtered = expenses.filter(exp => selectedMonth === 0 || exp.month === selectedMonth);

  filtered.forEach((expense, index) => {
    const li = document.createElement('li');
    let label = `${expense.date} - [${expense.category}] ${expense.item} (${expense.card}): ${expense.amount}원`;
    if (expense.installmentInfo) {
      label += ` (${expense.installmentInfo})`;
    }

    li.textContent = label;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => {
      expenses.splice(index, 1);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      renderExpenses();
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);

    categorySum[expense.category] += parseInt(expense.amount);
    cardSum[expense.card] += parseInt(expense.amount);
    total += parseInt(expense.amount);
  });

  for (let cat in categorySum) {
    const li = document.createElement('li');
    li.textContent = `${cat}: ${categorySum[cat]}원`;
    categoryTotals.appendChild(li);
  }

  for (let card in cardSum) {
    const li = document.createElement('li');
    li.textContent = `${card}: ${cardSum[card]}원`;
    cardTotals.appendChild(li);
  }

  totalSum.textContent = `총 지출: ${total}원`;
}

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const item = document.getElementById('item').value.trim();
  const amount = parseInt(document.getElementById('amount').value.trim());
  const category = document.getElementById('category').value;
  const card = document.getElementById('card').value;
  const installmentTypeVal = installmentType.value;
  const installmentMonths = parseInt(installmentMonthsInput.value);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR');
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (!item || !amount || !category || !card || !installmentTypeVal || (installmentTypeVal === '할부' && (!installmentMonths || installmentMonths < 2 || installmentMonths > 12))) {
    alert('모든 항목을 올바르게 입력해주세요.');
    return;
  }

  if (installmentTypeVal === '일시불') {
    expenses.push({ date: dateStr, item, amount, category, card, month: currentMonth });
  } else {
    const perMonthAmount = Math.floor(amount / installmentMonths);
    const leftover = amount % installmentMonths;

    for (let i = 0; i < installmentMonths; i++) {
      const date = new Date(currentYear, now.getMonth() + i, now.getDate());
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const partAmount = i === installmentMonths - 1 ? perMonthAmount + leftover : perMonthAmount;
      expenses.push({
        date: date.toLocaleDateString('ko-KR'),
        item,
        amount: partAmount,
        category,
        card,
        month,
        installmentInfo: `${i + 1}/${installmentMonths}`
      });
    }
  }

  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  form.reset();
  installmentMonthsInput.disabled = true;
});

monthTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    monthTabs.forEach(btn => btn.classList.remove('active'));
    tab.classList.add('active');
    selectedMonth = parseInt(tab.dataset.month);
    renderExpenses();
  });
});

renderExpenses();
