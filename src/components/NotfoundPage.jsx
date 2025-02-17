import React from 'react';
import { Link } from "react-router-dom";


export function NotfoundPage() {
    return (
    <div className='notfoundpagebody'>
       <div className='notfoundpage'>
        <h1>Страница не найдена</h1>
        <p>
            <Link className='homeback' to="/">Вернуться на главную страницу</Link>
        </p>
       </div>
    </div>
    )
}

export default NotfoundPage;