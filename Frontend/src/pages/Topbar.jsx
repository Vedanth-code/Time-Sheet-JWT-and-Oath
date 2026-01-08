import "./Topbar.css"
function Topbar() {
    return (
        <div className="topbar">
            <h1>Dashboard</h1>
            <div id="search">
                <form action="">
                    <input type="text" placeholder="Search task ..."/>
                </form>
            </div>

            <div id="profie">

            </div>

        </div>
    )
}

export default Topbar;